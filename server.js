import "dotenv/config";
import express from "express";
import path from "node:path";
import { MongoClient, ObjectId } from "mongodb";
import {
  createPublicClient,
  decodeFunctionData,
  defineChain,
  getAddress,
  http,
  parseAbi,
  parseEventLogs,
} from "viem";

const app = express();
const port = Number(process.env.PORT) || 3000;
const distPath = path.resolve(process.cwd(), "dist");
const allowedSorts = new Set(["marketCap", "newest", "volume"]);
const ponsTokenCache = new Map();
let ethUsdCache = null;
const factoryAddress = "0x7ed598bcef8bd9edd8c97a195c6d13f40801ec7e";
const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
});
const launchAbi = parseAbi([
  "function launchToken((string name, string symbol, string logo, string description, (string twitter, string telegram, string discord, string website, string farcaster) socials, address creatorFeeRecipient, uint16 creatorTaxBps, bool buybackEnabled, bytes32 expectedEconomics, bytes32 salt) params, uint256 launchConfigId, address pairToken) payable returns (address token, address curve)",
  "event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)",
]);
const chainClient = createPublicClient({
  chain: robinhoodChain,
  transport: http(),
});
const mongoClient = process.env.MONGODB_URI
  ? new MongoClient(process.env.MONGODB_URI)
  : undefined;
let database;
app.use(express.json({ limit: "100kb" }));

const requireDatabase = (response) => {
  if (database) return true;
  response.status(503).json({
    error: "MongoDB is not configured. Set MONGODB_URI in the server environment.",
  });
  return false;
};

const getCreatorFeeRecipient = () => {
  const configuredAddress = process.env.CREATOR_FEE_RECIPIENT?.trim();
  if (!configuredAddress || !/^0x[a-fA-F0-9]{40}$/.test(configuredAddress)) {
    throw new Error(
      "CREATOR_FEE_RECIPIENT must be a valid wallet address in the server environment.",
    );
  }
  return getAddress(configuredAddress);
};

app.get("/api/launch-ready", (_request, response) => {
  if (!requireDatabase(response)) return;
  response.json({ ready: true });
});

app.get("/api/launch-config", (_request, response) => {
  try {
    response.set("Cache-Control", "no-store").json({
      creatorFeeRecipient: getCreatorFeeRecipient(),
      creatorTaxBps: 200,
    });
  } catch (error) {
    console.error("Creator fee configuration is invalid:", error);
    response.status(503).json({
      error:
        "Creator fees are not configured. Set a valid CREATOR_FEE_RECIPIENT in the server .env.",
    });
  }
});

app.get("/api/eth-usd", async (_request, response) => {
  if (ethUsdCache && ethUsdCache.expiresAt > Date.now()) {
    response.set("Cache-Control", "no-store").json({
      priceUsd: ethUsdCache.priceUsd,
      fetchedAt: ethUsdCache.fetchedAt,
    });
    return;
  }

  const providers = [
    {
      name: "DefiLlama",
      load: async () => {
        const upstream = await fetch(
          "https://coins.llama.fi/prices/current/coingecko:ethereum",
          { signal: AbortSignal.timeout(8_000) },
        );
        if (!upstream.ok) {
          throw new Error(`DefiLlama returned HTTP ${upstream.status}.`);
        }
        const data = await upstream.json();
        return data.coins?.["coingecko:ethereum"]?.price;
      },
    },
    {
      name: "CoinGecko",
      load: async () => {
      const upstream = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
        { signal: AbortSignal.timeout(8_000) },
      );
      if (!upstream.ok) {
        throw new Error(`CoinGecko returned HTTP ${upstream.status}.`);
      }
      const data = await upstream.json();
      return data.ethereum?.usd;
      },
    },
  ];

  const results = await Promise.allSettled(
    providers.map(async (provider) => {
      const price = await provider.load();
      if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
        throw new Error(`${provider.name} returned an invalid ETH/USD price.`);
      }
      return price;
    }),
  );
  const successfulPrice = results.find(
    (result) => result.status === "fulfilled",
  );
  const priceUsd =
    successfulPrice?.status === "fulfilled" ? successfulPrice.value : undefined;
  for (const [index, result] of results.entries()) {
    if (result.status === "rejected") {
      console.error(
        `${providers[index].name} ETH/USD request failed:`,
        result.reason,
      );
    }
  }
  if (priceUsd === undefined) {
    response.status(502).json({
      error: "ETH/USD pricing is temporarily unavailable from DefiLlama and CoinGecko.",
    });
    return;
  }

  ethUsdCache = {
    priceUsd,
    fetchedAt: new Date().toISOString(),
    expiresAt: Date.now() + 20_000,
  };
  response.set("Cache-Control", "no-store").json({
    priceUsd,
    fetchedAt: ethUsdCache.fetchedAt,
  });
});

app.post(
  "/api/assets",
  express.raw({
    type: ["image/png", "image/jpeg", "image/webp"],
    limit: "2mb",
  }),
  async (request, response) => {
    if (!requireDatabase(response)) return;
    const contentType = request.headers["content-type"];
    if (
      typeof contentType !== "string" ||
      !["image/png", "image/jpeg", "image/webp"].includes(contentType) ||
      !Buffer.isBuffer(request.body) ||
      request.body.length === 0
    ) {
      response.status(415).json({ error: "Use a PNG, JPG, or WEBP image." });
      return;
    }

    try {
      const extension = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
      }[contentType];
      const uploadForm = new FormData();
      uploadForm.set("reqtype", "fileupload");
      uploadForm.set(
        "fileToUpload",
        new Blob([request.body], { type: contentType }),
        `cosmopad-token.${extension}`,
      );
      const upstream = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: uploadForm,
        signal: AbortSignal.timeout(45_000),
      });
      const publicImageUrl = (await upstream.text()).trim();
      if (
        !/^https:\/\/files\.catbox\.moe\/[A-Za-z0-9]+\.(?:png|jpe?g|webp)$/i.test(
          publicImageUrl,
        )
      ) {
        throw new Error(
          `Public image host rejected the upload (HTTP ${upstream.status}).`,
        );
      }
      const imageCheck = await fetch(publicImageUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(12_000),
      });
      if (
        !imageCheck.ok ||
        !imageCheck.headers.get("content-type")?.startsWith("image/")
      ) {
        throw new Error("Uploaded image could not be verified as publicly reachable.");
      }
      const result = await database.collection("tokenAssets").insertOne({
        contentType,
        data: request.body,
        publicUrl: publicImageUrl,
        createdAt: new Date(),
      });
      response.status(201).json({ url: publicImageUrl });
    } catch (error) {
      console.error("Could not store token image:", error);
      response.status(502).json({
        error:
          error instanceof Error
            ? error.message
            : "Could not upload a publicly accessible token image.",
      });
    }
  },
);

app.get("/api/assets/:id", async (request, response) => {
  if (!requireDatabase(response)) return;
  if (!ObjectId.isValid(request.params.id)) {
    response.status(400).json({ error: "Invalid image id." });
    return;
  }
  try {
    const asset = await database
      .collection("tokenAssets")
      .findOne({ _id: new ObjectId(request.params.id) });
    if (!asset) {
      response.status(404).json({ error: "Image not found." });
      return;
    }
    response
      .set("X-Content-Type-Options", "nosniff")
      .set("Cache-Control", "public, max-age=31536000, immutable")
      .set("Access-Control-Allow-Origin", "*")
      .type(asset.contentType)
      .send(
        Buffer.isBuffer(asset.data)
          ? asset.data
          : asset.data.value(true),
      );
  } catch (error) {
    console.error("Could not retrieve token image:", error);
    response.status(500).json({ error: "Could not retrieve token image." });
  }
});

app.get("/api/token-launches/:token", async (request, response) => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(request.params.token)) {
    response.status(400).json({ error: "Invalid token address." });
    return;
  }
  if (!requireDatabase(response)) return;

  try {
    const launch = await database.collection("tokenLaunches").findOne({
      token: request.params.token.toLowerCase(),
    });
    if (!launch) {
      response.status(404).json({ error: "No saved CosmoPad launch details were found." });
      return;
    }
    const { _id, ...details } = launch;
    response.set("Cache-Control", "no-store").json(details);
  } catch (error) {
    console.error("Could not read token launch details:", error);
    response.status(500).json({ error: "Could not load token launch details." });
  }
});

app.get("/api/user-launches", async (request, response) => {
  if (!requireDatabase(response)) return;
  const isExplore = request.query.scope === "explore";
  const requestedOwner = request.query.owner;
  if (
    (!isExplore &&
      (typeof requestedOwner !== "string" ||
        !/^0x[a-fA-F0-9]{40}$/.test(requestedOwner))) ||
    (isExplore && requestedOwner !== undefined)
  ) {
    response.status(400).json({ error: "A valid owner or explore scope is required." });
    return;
  }

  try {
    const query = isExplore
      ? {}
      : { owner: requestedOwner.toLowerCase() };
    const launches = await database
      .collection("tokenLaunches")
      .find(query)
      .sort({ launchedAt: -1 })
      .limit(isExplore ? 100 : 200)
      .toArray();
    response.set("Cache-Control", "no-store").json(
      launches.map(({ _id, ...launch }) => launch),
    );
  } catch (error) {
    console.error("Could not read saved token launches:", error);
    response.status(500).json({ error: "Could not load token launches." });
  }
});

app.post("/api/user-launches", async (request, response) => {
  if (!requireDatabase(response)) return;
  const { owner, transactionHash } = request.body ?? {};
  if (
    typeof owner !== "string" ||
    !/^0x[a-fA-F0-9]{40}$/.test(owner) ||
    typeof transactionHash !== "string" ||
    !/^0x[a-fA-F0-9]{64}$/.test(transactionHash)
  ) {
    response.status(400).json({ error: "A valid wallet and transaction hash are required." });
    return;
  }

  try {
    const receipt = await chainClient.getTransactionReceipt({
      hash: transactionHash,
    });
    if (receipt.status !== "success") {
      response.status(422).json({ error: "The launch transaction did not succeed." });
      return;
    }
    if (receipt.to?.toLowerCase() !== factoryAddress) {
      response.status(422).json({ error: "Transaction was not sent to the PonsFamily factory." });
      return;
    }

    const transaction = await chainClient.getTransaction({
      hash: transactionHash,
    });
    if (transaction.from.toLowerCase() !== owner.toLowerCase()) {
      response.status(403).json({ error: "The transaction sender does not match this wallet." });
      return;
    }
    const decoded = decodeFunctionData({
      abi: launchAbi,
      data: transaction.input,
    });
    if (decoded.functionName !== "launchToken") {
      response.status(422).json({ error: "Transaction is not a token launch." });
      return;
    }

    const [params, launchConfigId] = decoded.args;
    const events = parseEventLogs({
      abi: launchAbi,
      logs: receipt.logs.filter(
        (log) => log.address.toLowerCase() === factoryAddress,
      ),
      eventName: "TokenLaunched",
      strict: false,
    });
    const launchedEvent = events.find(
      (event) =>
        event.args.deployer.toLowerCase() === owner.toLowerCase() &&
        event.args.launchConfigId === launchConfigId,
    );
    if (
      !launchedEvent ||
      params.creatorFeeRecipient.toLowerCase() !==
        getCreatorFeeRecipient().toLowerCase() ||
      params.creatorTaxBps !== 200
    ) {
      response.status(422).json({
        error:
          "The launch did not use the configured 2% creator fee recipient.",
      });
      return;
    }

    const block = await chainClient.getBlock({ blockNumber: receipt.blockNumber });
    const launch = {
      token: getAddress(launchedEvent.args.token).toLowerCase(),
      name: params.name,
      symbol: params.symbol,
      logo: params.logo,
      description: params.description,
      socials: params.socials,
      owner: getAddress(owner).toLowerCase(),
      transactionHash,
      launchConfigId: Number(launchConfigId),
      pairToken: launchedEvent.args.pairToken,
      launchedAt: new Date(Number(block.timestamp) * 1000).toISOString(),
    };
    await database
      .collection("tokenLaunches")
      .updateOne(
        { token: launch.token },
        { $setOnInsert: launch },
        { upsert: true },
      );
    response.status(201).json({ launch });
  } catch (error) {
    const errorCode =
      typeof error === "object" && error !== null && "code" in error
        ? error.code
        : undefined;
    if (errorCode === "TransactionReceiptNotFoundError") {
      response.status(409).json({ error: "Launch transaction is not confirmed yet." });
      return;
    }
    console.error("Could not verify and save PonsFamily launch:", error);
    response.status(502).json({ error: "Could not verify the launch transaction." });
  }
});

app.get("/api/pons-token/:token", async (request, response) => {
  const token = request.params.token;
  if (!/^0x[a-fA-F0-9]{40}$/.test(token)) {
    response.status(400).json({ error: "Invalid token address." });
    return;
  }

  const normalizedToken = token.toLowerCase();
  const cached = ponsTokenCache.get(normalizedToken);
  if (cached && cached.expiresAt > Date.now()) {
    response.set("Cache-Control", "no-store").json(cached.result);
    return;
  }

  try {
    let match = null;
    for (let page = 1; page <= 4 && !match; page += 1) {
      const params = new URLSearchParams({
        explore: "1",
        sort: "newest",
        age: "all",
        page: String(page),
        pageSize: "30",
        graduatedPage: "1",
        graduatedPageSize: "0",
        includeGraduated: "0",
        version: "all",
        v: "22",
      });
      const upstream = await fetch(
        `https://www.ponsfamily.com/api/pons-launches?${params}`,
        { signal: AbortSignal.timeout(12_000) },
      );
      if (!upstream.ok) {
        throw new Error(`PonsFamily returned HTTP ${upstream.status}.`);
      }
      const data = await upstream.json();
      if (!Array.isArray(data.active?.items)) {
        throw new Error("PonsFamily returned an invalid launch list.");
      }
      match =
        data.active.items.find(
          (item) =>
            typeof item.token === "string" &&
            item.token.toLowerCase() === normalizedToken,
        ) ?? null;
      if (data.active.items.length < 30) break;
    }

    const result = match
      ? {
          token: match.token,
          priceUsd: match.priceUsd ?? null,
          marketCapUsd: match.realMcapUsd ?? match.marketCapUsd ?? null,
          liquidityUsd: match.liquidityUsd ?? null,
          quoteSymbol: match.quoteAsset?.symbol ?? null,
          graduated: Boolean(match.graduated),
        }
      : null;
    if (ponsTokenCache.size > 500) ponsTokenCache.clear();
    ponsTokenCache.set(normalizedToken, {
      result,
      expiresAt: Date.now() + 8_000,
    });
    response.set("Cache-Control", "no-store").json(result);
  } catch (error) {
    console.error("PonsFamily token data request failed:", error);
    response.status(502).json({ error: "Live PonsFamily token data is unavailable." });
  }
});

app.get("/api/pons-launches", async (request, response) => {
  const sort = String(request.query.sort ?? "marketCap");
  const page = Number(request.query.page ?? 1);
  const pageSize = Number(request.query.pageSize ?? 30);

  if (
    !allowedSorts.has(sort) ||
    !Number.isInteger(page) ||
    page < 1 ||
    page > 4 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 30 ||
    (page - 1) * 30 + pageSize > 100
  ) {
    response.status(400).json({ error: "Invalid launch feed request." });
    return;
  }

  const params = new URLSearchParams({
    explore: "1",
    sort,
    age: "all",
    page: String(page),
    pageSize: String(pageSize),
    graduatedPage: "1",
    graduatedPageSize: "0",
    includeGraduated: "0",
    version: "all",
    v: "22",
  });

  try {
    const upstream = await fetch(
      `https://www.ponsfamily.com/api/pons-launches?${params}`,
      { signal: AbortSignal.timeout(20_000) },
    );
    const body = await upstream.text();
    response
      .set("Cache-Control", "no-store")
      .status(upstream.status)
      .type(upstream.headers.get("content-type") ?? "application/json")
      .send(body);
  } catch (error) {
    console.error("PonsFamily launch feed request failed:", error);
    response
      .status(502)
      .json({ error: "PonsFamily launch feed is unavailable." });
  }
});

app.use(express.static(distPath));
app.get("*", (_request, response) => {
  response.sendFile(path.join(distPath, "index.html"));
});

if (mongoClient) {
  void mongoClient
    .connect()
    .then(async (client) => {
      const connectedDatabase = client.db(
        process.env.MONGODB_DB || "cosmopad",
      );
      await Promise.all([
        connectedDatabase
          .collection("tokenLaunches")
          .createIndex({ token: 1 }, { unique: true }),
        connectedDatabase
          .collection("tokenLaunches")
          .createIndex({ owner: 1, launchedAt: -1 }),
      ]);
      database = connectedDatabase;
      console.log("MongoDB connected.");
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error);
    });
} else {
  console.warn("MongoDB is not configured; token launches cannot be saved.");
}

app.listen(port, () => {
  console.log(`CosmoPad is listening on port ${port}.`);
});

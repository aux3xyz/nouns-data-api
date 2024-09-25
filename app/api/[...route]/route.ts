import { Hono } from "hono";
import { handle } from "hono/vercel";
import { Db, MongoClient } from "mongodb";

const app = new Hono().basePath("/api");

const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri);

let db: Db | null = null;

// Initialize database connection
async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db("noun");
    console.log("Connected to MongoDB");
  }
  return db;
}

// Middleware to ensure database connection
app.use("*", async (c, next) => {
  try {
    const database = await connectToDatabase();
    c.set("db" as never, database);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return c.text("Database connection error", 500);
  }
  await next();
});

// Route for retrieving all nouns
app.get("/nouns", async (c) => {
  const db = c.get("db" as never) as Db;
  console.log(await db.collection("ProposalCreated").findOne());
  return c.text("List of all Nouns NFTs");
});

// Route for retrieving a single noun by ID
app.get("/nouns/:nounId", async (c) => {
  const nounId = c.req.param("nounId");
  return c.text(`Details of Noun NFT #${nounId}`);
});

// List of all Proposals to the Nouns DAO
app.get("/props", async (c) => {
  const db = c.get("db" as never) as Db;

  // Get pagination parameters from query
  let page = Math.max(parseInt(c.req.query("page") || "1", 10), 1);
  let limit = Math.min(parseInt(c.req.query("limit") || "10", 10), 50);

  // Calculate skip value
  const skip = (page - 1) * limit;

  const props = await db
    .collection("ProposalCreated")
    .find(
      {},
      {
        projection: {
          _id: 0,
          id: 1,
          proposer: 1,
          description: 1,
          calldatas: 1,
          targets: 1,
          values: 1,
          startBlock: 1,
          endBlock: 1,
          txHash: 1,
          blockNumber: 1,
        },
      },
    )
    .sort({ id: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  return c.json(props);
});

// Get Lastest Proposal
app.get("props/latest", async (c) => {
  const db = c.get("db" as never) as Db;
  const prop = await db.collection("ProposalCreated").findOne(
    {},
    {
      projection: {
        _id: 0,
        id: 1,
        proposer: 1,
        description: 1,
        calldatas: 1,
        targets: 1,
        values: 1,
        startBlock: 1,
        endBlock: 1,
        txHash: 1,
        blockNumber: 1,
      },
      sort: { id: -1 },
    },
  );

  return c.json(prop);
});

// Specific Proposal by propId
app.get("/props/:propId", async (c) => {
  const propId = c.req.param("propId");
  const summary = c.req.query("summary") === "true";
  if (summary) {
    return c.text(`Summary of Proposal #${propId}`);
  }
  const db = c.get("db" as never) as Db;
  const prop = await db.collection("ProposalCreated").findOne(
    {
      id: propId,
    },
    {
      projection: {
        _id: 0,
        id: 1,
        proposer: 1,
        description: 1,
        calldatas: 1,
        targets: 1,
        values: 1,
        startBlock: 1,
        endBlock: 1,
        txHash: 1,
        blockNumber: 1,
      },
    },
  );

  return c.json(prop);
});

// Route for retrieving all votes for a specific prop
app.get("/props/:propId/votes", async (c) => {
  const propId = c.req.param("propId");
  const summary = c.req.query("summary") === "true";
  const type = c.req.query("type") || "all"; // "all", "signal", or "sponsor"
  const skip = c.req.query("skip");

  if (summary) {
    return c.text(
      `Summary of all ${type} votes for Proposal #${propId}, skip: ${skip}`,
    );
  }
  return c.text(
    `List of all ${type} votes for Proposal #${propId}, skip: ${skip}`,
  );
});

// Route for retrieving a specific vote by ID for a specific prop
app.get("/props/:propId/votes/:voteId", async (c) => {
  const propId = c.req.param("propId");
  const voteId = c.req.param("voteId");
  const summary = c.req.query("summary") === "true";
  if (summary) {
    return c.text(`Summary of vote #${voteId} on Proposal #${propId}`);
  }
  return c.text(`Details of vote #${voteId} on Proposal #${propId}`);
});

// Route for retrieving all propdates (comments) with optional filtering
app.get("/propdates", async (c) => {
  const propId = c.req.query("propId");
  const skip = c.req.query("skip");
  const summary = c.req.query("summary") === "true";

  if (propId) {
    if (summary) {
      return c.text(
        `Summary of all propdates for Proposal #${propId}, skip: ${skip}`,
      );
    }
    return c.text(
      `List of all propdates for Proposal #${propId}, skip: ${skip}`,
    );
  }

  if (summary) {
    return c.text(`Summary of all propdates, skip: ${skip}`);
  }
  return c.text(`List of all propdates, skip: ${skip}`);
});

// Route for retrieving a specific propdate by ID
app.get("/propdates/:propdateId", async (c) => {
  const propdateId = c.req.param("propdateId");
  const summary = c.req.query("summary") === "true";
  if (summary) {
    return c.text(`Summary of propdate #${propdateId}`);
  }
  return c.text(`Details of propdate #${propdateId}`);
});

// Route for retrieving all candidates
app.get("/candidates", async (c) => {
  const summary = c.req.query("summary") === "true";
  const skip = c.req.query("skip");
  if (summary) {
    return c.text(`Summary of all candidates, skip: ${skip}`);
  }
  return c.text(`List of all candidates, skip: ${skip}`);
});

// Route for retrieving a single candidate by slug
app.get("/candidates/:slug", async (c) => {
  const slug = c.req.param("slug");
  const summary = c.req.query("summary") === "true";
  if (summary) {
    return c.text(`Summary of Candidate with slug #${slug}`);
  }
  return c.text(`Details of Candidate with slug #${slug}`);
});

// Route for retrieving all votes for a specific candidate
app.get("/candidates/:slug/votes", async (c) => {
  const slug = c.req.param("slug");
  const summary = c.req.query("summary") === "true";
  const type = c.req.query("type") || "all"; // "all", "signal", or "sponsor"
  const skip = c.req.query("skip");

  if (summary) {
    return c.text(
      `Summary of all ${type} votes for Candidate #${slug}, skip: ${skip}`,
    );
  }
  return c.text(
    `List of all ${type} votes for Candidate #${slug}, skip: ${skip}`,
  );
});

export const GET = handle(app);

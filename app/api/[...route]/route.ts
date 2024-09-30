import { Hono } from "hono";
import { handle } from "hono/vercel";
import { Db, MongoClient } from "mongodb";

const app = new Hono().basePath("/api");

const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri);

let db: Db | null = null;

let proposalProjection = {
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
  msgSender: 1,
};

let candidateProjection = {
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
  slug: 1,
  proposalIdToUpdate: 1,
  encodedProposalHash: 1,
};

// Initialize database connection
async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db("noun");
    console.log("Connected to MongoDB, 🫡");
  }
  console.log("Already Connected to MongoDB! hehe!!!");
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
        projection: proposalProjection,
        sort: { id: -1 },
      },
    )
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
      projection: proposalProjection,
      sort: { blockNumber: -1 },
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
      id: Number(propId),
    },
    {
      projection: proposalProjection,
    },
  );

  return c.json(prop);
});

// Route for retrieving all feedback for a specific prop
app.get("/props/:propId/feedback", async (c) => {
  const propId = c.req.param("propId");

  const db = c.get("db" as never) as Db;
  const feedback = await db
    .collection("FeedbackSent")
    .find(
      {
        proposalId: Number(propId),
      },
      {
        projection: {
          _id: 0,
          proposalId: 1,
          blockNumber: 1,
          reason: 1,
          support: 1,
          msgSender: 1,
          txHash: 1,
        },
        sort: { blockNumber: -1 },
      },
    )
    .toArray();

  return c.json(feedback);
});

// Route for retrieving all votes for a specific prop
app.get("/props/:propId/votes", async (c) => {
  const propId = c.req.param("propId");

  const db = c.get("db" as never) as Db;
  const feedback = await db
    .collection("VoteCast")
    .find(
      {
        proposalId: Number(propId),
      },
      {
        projection: {
          _id: 0,
          proposalId: 1,
          blockNumber: 1,
          reason: 1,
          support: 1,
          voter: 1,
          votes: 1,
          txHash: 1,
        },
        sort: { blockNumber: -1 },
      },
    )
    .toArray();

  return c.json(feedback);
});

// Route for retrieving all propdates (comments) with optional filtering
app.get("/propdates", async (c) => {
  const db = c.get("db" as never) as Db;

  // Get pagination parameters from query
  let page = Math.max(parseInt(c.req.query("page") || "1", 10), 1);
  let limit = Math.min(parseInt(c.req.query("limit") || "10", 10), 50);

  // Calculate skip value
  const skip = (page - 1) * limit;

  const propdates = await db
    .collection("PostUpdate")
    .find(
      {},
      {
        projection: {
          _id: 0,
          propId: 1,
          txHash: 1,
          blockNumber: 1,
          msgSender: 1,
          update: 1,
          isCompleted: 1,
        },
        sort: { blockNumber: -1 },
      },
    )
    .skip(skip)
    .limit(limit)
    .toArray();

  return c.json(propdates);
});

// Route for retrieving a specific propdate by propId
app.get("/propdates/:propId", async (c) => {
  const proposalId = c.req.param("propId");
  const db = c.get("db" as never) as Db;

  const propdates = await db
    .collection("PostUpdate")
    .find(
      {
        propId: Number(proposalId),
      },
      {
        projection: {
          _id: 0,
          propId: 1,
          txHash: 1,
          blockNumber: 1,
          msgSender: 1,
          update: 1,
          isCompleted: 1,
        },
        sort: { blockNumber: -1 },
      },
    )
    .toArray();

  return c.json(propdates);
});

// Route for retrieving all candidates
app.get("/candidates", async (c) => {
  const db = c.get("db" as never) as Db;

  // Get pagination parameters from query
  let page = Math.max(parseInt(c.req.query("page") || "1", 10), 1);
  let limit = Math.min(parseInt(c.req.query("limit") || "10", 10), 50);

  // Calculate skip value
  const skip = (page - 1) * limit;

  const props = await db
    .collection("ProposalCandidateCreated")
    .find(
      {},
      {
        projection: candidateProjection,
        sort: { blockNumber: -1 },
      },
    )
    .skip(skip)
    .limit(limit)
    .toArray();

  return c.json(props);
});

// Route for retrieving a single candidate by slug
app.get("/candidates/:slug", async (c) => {
  const slug = c.req.param("slug");
  const summary = c.req.query("summary") === "true";
  if (summary) {
    return c.text(`Summary of Candiate with slug ${slug}`);
  }
  const db = c.get("db" as never) as Db;
  const prop = await db.collection("ProposalCandidateCreated").findOne(
    {
      slug,
    },
    {
      projection: candidateProjection,
    },
  );

  return c.json(prop);
});

// Route for retrieving all feedback for a specific candidate
app.get("/candidates/:slug/feedback", async (c) => {
  const slug = c.req.param("slug");

  const db = c.get("db" as never) as Db;
  const feedback = await db
    .collection("CandidateFeedbackSent")
    .find(
      {
        slug,
      },
      {
        projection: {
          _id: 0,
          txHash: 1,
          proposalId: 1,
          blockNumber: 1,
          reason: 1,
          support: 1,
          msgSender: 1,
        },
        sort: { blockNumber: -1 },
      },
    )
    .toArray();

  return c.json(feedback);
});

// Route for retrieving all sponsors for a specific candidate
app.get("/candidates/:slug/signatures", async (c) => {
  const slug = c.req.param("slug");

  const db = c.get("db" as never) as Db;
  const feedback = await db
    .collection("SignatureAdded")
    .find(
      {
        slug,
      },
      {
        projection: {
          _id: 0,
          txHash: 1,
          blockNumber: 1,
          reason: 1,
          slug: 1,
          signer: 1,
          proposer: 1,
        },
        sort: { blockNumber: -1 },
      },
    )
    .toArray();

  return c.json(feedback);
});

export const GET = handle(app);

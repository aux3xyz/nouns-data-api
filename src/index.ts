import { Hono } from "hono";
import { Db, MongoClient } from "mongodb";

const app = new Hono();
const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri);

// Middleware to establish and manage MongoDB connection
app.use("*", async (c, next) => {
  try {
    if (!client?.topology || !client?.topology.isConnected()) {
      await client.connect();
      console.log("Connected to MongoDB");
    }
    const db = client.db("noun");
    c.set("db" as never, db);
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

// Route for retrieving all props (proposals)
app.get("/props", async (c) => {
  return c.text("List of all Proposals to the Nouns DAO");
});

// Route for retrieving a single prop by ID
app.get("/props/:propId", async (c) => {
  const propId = c.req.param("propId");
  const summary = c.req.query("summary") === "true";
  if (summary) {
    return c.text(`Summary of Proposal #${propId}`);
  }
  return c.text(`Details of Proposal #${propId}`);
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

export default app;

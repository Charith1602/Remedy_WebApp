const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/static", express.static(path.join(__dirname, "static")));

// Database connection configuration
const dbConfig = {
  user: "anitta",
  password: "anipm",
  connectString: "192.168.58.238/FREEPDB1",
};

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/templates/home.html"));
});

app.get("/submitForm", (req, res) => {
  res.sendFile(path.join(__dirname, "/templates/index.html"));
});

app.get("/updateForm", (req, res) => {
  res.sendFile(path.join(__dirname, "/templates/update.html"));
});

//Endpoint for submitting data
app.post("/submitData", async (req, res) => {
  const data = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig); // Establish database connection

    const creationDate = new Date(data.CREATION_DATE);
    const formattedCreationDate = `${("0" + creationDate.getDate()).slice(
      -2
    )}-${("0" + (creationDate.getMonth() + 1)).slice(-2)}-${creationDate
      .getFullYear()
      .toString()
      .slice(-2)}`;

    // Update the data object with the formatted creation date
    data.CREATION_DATE = formattedCreationDate;

    const closureDate = new Date(data.CLOSURE_DATE);
    const formattedClosureDate = `${("0" + closureDate.getDate()).slice(-2)}-${(
      "0" +
      (closureDate.getMonth() + 1)
    ).slice(-2)}-${closureDate.getFullYear().toString().slice(-2)}`;

    // Update the data object with the formatted closure date
    data.CLOSURE_DATE = formattedClosureDate;

    const query = `
            INSERT INTO remedy_incidents (
                INCIDENT_ID,
                COMPANY,
                ORGANIZATION,
                DEPARTMENT,
                CONTACT,
                SUMMARY,
                AUTHORIZATION_GRP,
                SERVICE,
                CI,
                INCIDENT_TYPE,
                REPORTED_SOURCE,
                ASSIGNED_GROUP,
                ASSIGNEE,
                VENDOR_GROUP,
                VENDOR_TICKET_NUMBER,
                STATUS,
                STATUS_REASON,
                PRIORITY,
                CREATION_DATE,
                OPEN_DURATION,
                CLOSURE_DATE
            )
            VALUES (
                :INCIDENT_ID,
                :COMPANY,
                :ORGANIZATION,
                :DEPARTMENT,
                :CONTACT,
                :SUMMARY,
                :AUTHORIZATION_GRP,
                :SERVICE,
                :CI,
                :INCIDENT_TYPE,
                :REPORTED_SOURCE,
                :ASSIGNED_GROUP,
                :ASSIGNEE,
                :VENDOR_GROUP,
                :VENDOR_TICKET_NUMBER,
                :STATUS,
                :STATUS_REASON,
                :PRIORITY,
                TO_DATE(:CREATION_DATE, 'DD-MM-YY'),  -- Use TO_DATE function to specify the date format
                :OPEN_DURATION,
                TO_DATE(:CLOSURE_DATE, 'DD-MM-YY')  -- Use TO_DATE function to specify the date format
            )
        `;
    // Assuming that req.body contains all the necessary fields
    const result = await connection.execute(query, data, { autoCommit: true });

    console.log("Data inserted:", result.rowsAffected);
    res.send("Successfully entered the data.");
  } catch (error) {
    console.error("Error inserting data:", error);
    res.sendStatus(500);
  }
});

app.get("/fetchData/:incidentId", async (req, res) => {
  const incidentId = req.params.incidentId;
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM remedy_incidents WHERE INCIDENT_ID = :incidentId`,
      [incidentId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows[0]);
    console.log("Data fetched:", result.rows[0]);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.sendStatus(500);
  }
});
app.post("/updateForm", (req, res) => {
  // Handle the POST request here
  // For example, you can update the database with the submitted form data
  res.send("Form data updated successfully");
});

app.post("/updateData", async (req, res) => {
  const data = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig); // Establish database connection

    const creationDate = new Date(data.CREATION_DATE);
    const formattedCreationDate = `${("0" + creationDate.getDate()).slice(
      -2
    )}-${("0" + (creationDate.getMonth() + 1)).slice(-2)}-${creationDate
      .getFullYear()
      .toString()
      .slice(-2)}`;

    // Update the data object with the formatted creation date
    data.CREATION_DATE = formattedCreationDate;

    const closureDate = new Date(data.CLOSURE_DATE);
    const formattedClosureDate = `${("0" + closureDate.getDate()).slice(-2)}-${(
      "0" +
      (closureDate.getMonth() + 1)
    ).slice(-2)}-${closureDate.getFullYear().toString().slice(-2)}`;

    // Update the data object with the formatted closure date
    data.CLOSURE_DATE = formattedClosureDate;

    const query = `
      UPDATE remedy_incidents
      SET
        COMPANY = :COMPANY,
        ORGANIZATION = :ORGANIZATION,
        DEPARTMENT = :DEPARTMENT,
        CONTACT = :CONTACT,
        SUMMARY = :SUMMARY,
        AUTHORIZATION_GRP = :AUTHORIZATION_GRP,
        SERVICE = :SERVICE,
        CI = :CI,
        INCIDENT_TYPE = :INCIDENT_TYPE,
        REPORTED_SOURCE = :REPORTED_SOURCE,
        ASSIGNED_GROUP = :ASSIGNED_GROUP,
        ASSIGNEE = :ASSIGNEE,
        VENDOR_GROUP = :VENDOR_GROUP,
        VENDOR_TICKET_NUMBER = :VENDOR_TICKET_NUMBER,
        STATUS = :STATUS,
        STATUS_REASON = :STATUS_REASON,
        PRIORITY = :PRIORITY,
        CREATION_DATE = TO_DATE(:CREATION_DATE, 'DD-MM-YY'),
        OPEN_DURATION = :OPEN_DURATION,
        CLOSURE_DATE = TO_DATE(:CLOSURE_DATE, 'DD-MM-YY')
      WHERE INCIDENT_ID = :INCIDENT_ID
    `;
    const result = await connection.execute(query, data, { autoCommit: true });

    console.log("Data updated:", result.rowsAffected);
    res.send("Successfully updated the data.");
  } catch (error) {
    console.error("Error updating data:", error);
    res.sendStatus(500);
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

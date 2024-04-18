const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/static', express.static(path.join(__dirname, 'static')));


// Database connection configuration
const dbConfig = {
    user: 'testing',
    password: 'testing123',
    connectString: '192.168.0.100/FREEPDB1'
};

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/templates/index1.html'));
});

app.get('/submitForm', (req, res) => {
    res.sendFile(path.join(__dirname, '/templates/index.html'));
});

app.get('/updateForm', (req, res) => {
    res.sendFile(path.join(__dirname, '/templates/update.html'));
});

app.get('/deleteForm', (req, res) => {
    res.sendFile(path.join(__dirname, '/templates/delete.html'));
});

// app.get('/searchForm', (req, res) => {
//     const queryParams = req.query;
//     const queryString = new URLSearchParams(queryParams).toString();
//     res.redirect(`/searchResults?${queryString}`);
// });
app.get('/searchForm', (req, res) => {
    // Handle the GET request for the search form
    res.sendFile(path.join(__dirname, '/templates/input_fields.html'));
});

app.get('/searchResults', (req, res) => {
    res.sendFile(path.join(__dirname, '/templates/result_records.html'));
});




// Endpoint for submitting data
app.post('/submitData', async (req, res) => {
    const data = req.body;
    
    try {
        const connection = await oracledb.getConnection(dbConfig); // Establish database connection

        const creationDate = new Date(data.CREATION_DATE);
        const formattedCreationDate = `${('0' + creationDate.getDate()).slice(-2)}-${('0' + (creationDate.getMonth() + 1)).slice(-2)}-${creationDate.getFullYear().toString().slice(-2)}`;

        // Update the data object with the formatted creation date
        data.CREATION_DATE = formattedCreationDate;

        const closureDate = new Date(data.CLOSURE_DATE);
        const formattedClosureDate = `${('0' + closureDate.getDate()).slice(-2)}-${('0' + (closureDate.getMonth() + 1)).slice(-2)}-${closureDate.getFullYear().toString().slice(-2)}`;

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
        
        console.log('Data inserted:', result.rowsAffected);
        res.send('Successfully entered the data.');
    } catch (error) {
        console.error('Error inserting data:', error);
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



//optionn
app.get("/fetchData", async (req, res) => {
    const queryParams = req.query; // Extract query parameters from the request URL
    const queryKeys = Object.keys(queryParams);
    const queryValues = Object.values(queryParams);
    
    let whereClause = '';
    for (let i = 0; i < queryKeys.length; i++) {
        if (queryValues[i]) {
            whereClause += `${queryKeys[i]} = :${queryKeys[i]} AND `;
        }
    }
    whereClause = whereClause.slice(0, -5); // Remove the trailing 'AND'

    try {
        const connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT * FROM remedy_incidents WHERE ${whereClause}`,
            queryParams, // Pass query parameters to the execute method
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows[0]);
        console.log("Data fetched:", result.rows[0]);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.sendStatus(500);
    }
});




  app.post('/deleteData/:incidentId', async (req, res) => {
    const incidentId = req.params.incidentId; // Extract incident ID from route parameter

    try {
        const connection = await oracledb.getConnection(dbConfig); // Establish database connection

        const result = await connection.execute(
            `DELETE FROM remedy_incidents WHERE INCIDENT_ID = :incidentId`,
            [incidentId],
            { autoCommit: true }
        );

        console.log('Data deleted:', result.rowsAffected);
        res.send('Successfully deleted the data.');
    } catch (error) {
        console.error('Error deleting data:', error);
        res.sendStatus(500);
    }
});

app.post("/updateForm", async (req, res) => {
    const data = req.body;
      console.log("recieved data at server :",data);
    try {
      const connection = await oracledb.getConnection(dbConfig); // Establish database connection
  
      // Update query
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
              WHERE
                  INCIDENT_ID = :INCIDENT_ID
          `;
  
      // Bind values for the query
      const binds = {
        COMPANY: data.COMPANY,
        ORGANIZATION: data.ORGANIZATION,
        DEPARTMENT: data.DEPARTMENT,
        CONTACT: data.CONTACT,
        SUMMARY: data.SUMMARY,
        AUTHORIZATION_GRP: data.AUTHORIZATION_GRP,
        SERVICE: data.SERVICE,
        CI: data.CI,
        INCIDENT_TYPE: data.INCIDENT_TYPE,
        REPORTED_SOURCE: data.REPORTED_SOURCE,
        ASSIGNED_GROUP: data.ASSIGNED_GROUP,
        ASSIGNEE: data.ASSIGNEE,
        VENDOR_GROUP: data.VENDOR_GROUP,
        VENDOR_TICKET_NUMBER: data.VENDOR_TICKET_NUMBER,
        STATUS: data.STATUS,
        STATUS_REASON: data.STATUS_REASON,
        PRIORITY: data.PRIORITY,
        CREATION_DATE: data.CREATION_DATE,
        OPEN_DURATION: data.OPEN_DURATION,
        CLOSURE_DATE: data.CLOSURE_DATE,
        INCIDENT_ID: data.INCIDENT_ID,
      };
  
      // Execute the update query
      const result = await connection.execute(query, binds, { autoCommit: true });
  
      console.log("Data updated:", result.rowsAffected);
      // Show alert popup on successful updation
      res.send("Successfully updated the data.");
    //   alert("Record updated successfully");
    } catch (error) {
      console.error("Error updating data:", error);
      res.sendStatus(500);
    }
  });

// app.get("/fetchData2", async (req, res) => {
//     const queryParams = req.query; // Extract query parameters from the request URL
//     const queryKeys = Object.keys(queryParams);
//     const queryValues = Object.values(queryParams);
    
//     let whereClause = '';
//     for (let i = 0; i < queryKeys.length; i++) {
//         if (queryValues[i]) {
//             whereClause += `${queryKeys[i]} = :${queryKeys[i]} AND `;
//         }
//     }
//     whereClause = whereClause.slice(0, -5); // Remove the trailing 'AND'

//     try {
//         const connection = await oracledb.getConnection(dbConfig);
//         const result = await connection.execute(
//             `SELECT * FROM remedy_incidents WHERE ${whereClause}`,
//             queryParams, // Pass query parameters to the execute method
//             { outFormat: oracledb.OUT_FORMAT_OBJECT }
//         );
//         await connection.close(); // Close the connection
        
//         // Redirect to result_record.html with the fetched data
//         res.render('result_record', { records: result.rows });
//     } catch (error) {
//         console.error("Error fetching data:", error);
//         res.sendStatus(500);
//     }
// });


// app.post("/fetchData2", async (req, res) => {
//     const requestData = req.body;

//     // Construct the WHERE clause dynamically based on the received data
//     const whereClause = Object.keys(requestData)
//         .map(key => `${key} = :${key}`)
//         .join(" AND ");

//     try {
//         const connection = await oracledb.getConnection(dbConfig);
//         const result = await connection.execute(
//             `SELECT * FROM remedy_incidents WHERE ${whereClause}`,
//             requestData,
//             { outFormat: oracledb.OUT_FORMAT_OBJECT }
//         );

//         await connection.close(); // Close the connection

//         // Send the fetched data to the client
//         res.json(result.rows);
//     } catch (error) {
//         console.error("Error fetching data:", error);
//         res.sendStatus(500);
//     }
// });


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

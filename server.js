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
    connectString: '192.168.224.214/FREEPDB1'
};

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/templates/index1.html'));
});

app.get('/submitForm', (req, res) => {
    res.sendFile(path.join(__dirname, '/templates/index.html'));
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

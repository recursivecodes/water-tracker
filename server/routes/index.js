const express = require('express');
const router = express.Router();

const oracledb = require('oracledb');
if( process.env.INSTANT_CLIENT_PATH ) {
    oracledb.initOracleClient({libDir: process.env.INSTANT_CLIENT_PATH});
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

router.get('/test', async function (req, res, next) {
    let connection;
    let result;

    try {
        connection = await getConnection();
        result = await connection.execute("select sysdate from dual");
    } 
    catch (err) {
        console.error(err);
    } 
    finally {
        await closeConnection();
        res.json(result);
    }
});

router.post('/save/:reading', async function (req, res, next) {
    let connection;
    let result;

    try {
        // get a connection 
        connection = await getConnection();
        /*
            use connection.execute() to run our
            insert query. first argument is the SQL
            statement and the values preceeded by a colon
            are "bind" variables. 

            the second argument passed to execute()
            is the bind variables. the first key in that 
            object is the reading value from the path
            parameter and the second key is is the id 
            returned by the insert statement.

            third arg is options - in this case we 
            tell the DB to auto commit our insert 
            so we don't have to manually commit it
        */
        result = await connection.execute(
            "insert into water (reading) values (:reading) return id into :id", 
            {
                reading: req.params.reading,
                id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            },
            { autoCommit: true }
        );
    } 
    catch (err) {
        // print out any errors
        console.error(err);
    } 
    finally {
        // make sure the connection is closed 
        await closeConnection();
        // return the result as JSON
        res.json(result);
    }
});

const getConnection = async () => {
    return await oracledb.getConnection({
        user: process.env.ORACLEDB_USER,
        password: process.env.ORACLEDB_PASSWORD,
        connectString: process.env.ORACLEDB_CONNECTIONSTRING
    });
};

const closeConnection = async (connection) => {
    if (connection) {
        try {
            await connection.close();
        } 
        catch (err) {
            console.error(err);
        }
    }
};

module.exports = router;
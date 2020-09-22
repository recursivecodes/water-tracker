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
        connection = await getConnection();
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
        console.error(err);
    } 
    finally {
        await closeConnection();
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
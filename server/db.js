const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ecommerce.db');
const bcrypt = require('bcrypt')

const createUserTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name VARCHAR(250),
            password VARCHAR(250)
        );
    `;

    db.run(query, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Table Created');
        }
    });
};

const insertValues = async () => {
    const userName = 'kumar'
    const pass = await bcrypt.hash('kumar@1234', 10)
    const query = `INSERT INTO users(user_name, password)
    VALUES ('${userName}', '${pass}');
    `

    db.run(query, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('user Added');
        }
    });
}

const deleteUser = async () => {
    const query = `DELETE FROM users
    WHERE user_id = ${2};
    `
    db.run(query, (err) => {
        if(err) return console.log(err.message)
        return console.log('user Deleted')
    })
}

deleteUser()

//insertValues()

//createUserTable()

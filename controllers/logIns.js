
export const handleSignIn = async (req, res, db, bcrypt) => {
    const { email, password } = req.body;
    if (email === "" || password === "") {
        return res.status(400).json("failed to login with appropriate info");
    }

    try {
        const data = await db.select("email", "hash").from("login").where("email", "=", email);
        if (data.length === 0) {
            return res.status(400).json("login failed");
        }
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if (isValid) {
            try {
                const user = await db.select("*").from("users").where("email", "=", email);
                return res.json(user[0]);
            } catch (error) {
                console.log("error: ", error);
                return res.status(400).json("login failed");
            }
        } else {
            return res.status(400).json("login failed");
        }
    } catch (error) {
        console.log("error: ", error);
        return res.status(400).json("login failed");
    }
};
``
export const handleRegister = async (req, res, db, bcrypt) => {
    const { email, name, password } = req.body;
    if (email === "" || password === "") {
        return res.status(400).json("unable to register");
    }

    const hash = bcrypt.hashSync(password);

    try {
        await db.transaction(async trx => {
            try {
                const loginEmail = await trx('login')
                    .insert({ hash: hash, email: email })
                    .returning('email');
                const response = await trx('users')
                    .insert({
                        email: loginEmail[0].email,
                        name: name,
                        joined: new Date()
                    })
                    .returning('*');
                return res.json(response[0]);
            } catch (error) {
                console.log("error: ", error);
                await trx.rollback();
                return res.status(400).json("unable to register");
            }
        });
    } catch (error) {
        console.log("error: ", error);
        return res.status(400).json("unable to register");
    }
};  
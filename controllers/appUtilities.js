import dotenv from 'dotenv';
dotenv.config();

export const getProfile = async (req, res, db) => {
    const { id } = req.params;
    try {
        const response = await db.select("*").from("users").where({ id: id });
        if (response.length !== 1) {
            return res.status(400).json("unable to get profile");
        }
        return res.json(response);
    } catch (error) {
        console.log("error: ", error);
        return res.status(400).json("unable to get profile");
    }
};

export const updateUserRank = async (req, res, db) => {
    const { id } = req.body;
    try {
        const data = await db("users")
            .where({ id: id })
            .increment("entries", 1)
            .returning("entries");
        return res.json(data[0]);
    } catch (error) {
        console.log("error: ", error);
        return res.status(500).json("failed to update rank");
    }
};

const USER_ID = process.env.USER_ID;
const APP_ID = process.env.APP_ID;
const MODEL_ID = process.env.MODEL_ID;
const MODEL_VERSION_ID = process.env.MODEL_VERSION_ID;

const getClarifyRequest = ((imageURL) => {
    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": USER_ID,
          "app_id": APP_ID
        },
      "inputs": [
        {
          "data": {
            "image": {
              "url": imageURL
            }
          }
        }
      ]
    });
    // console.log("body: ", JSON.parse(raw))
  
    const requestOptions = {
        method: 'POST',
        headers: {
            // 'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Key ' + process.env.API_CLARIFAI_PAT,
            // 'Access-Control-Allow-Origin' : "*",
            // "origin" : "*"
        },
        body: raw
    };
  
    return requestOptions
})

export const getoutput = async (req, res) => {
    // https://www.shutterstock.com/image-photo/happy-businessman-enjoying-home-office-600nw-2257033579.jpg
    const { imgURL } = req.body

    try {
        const requestOptions = getClarifyRequest(imgURL);
        console.log("requestOptions: ", requestOptions)
        const url = "https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID  + "/outputs";

        const response = await fetch(url, requestOptions);
        const data = await response.json();
        // console.log("data: ", data)
        // console.log("\n\ndata.outputs[0]: ", data.outputs[0].data.regions)
        return res.status(200).json(data);
    } catch (error) {
        console.log('error', error)
        return res.status(500).json(error)
    }

}
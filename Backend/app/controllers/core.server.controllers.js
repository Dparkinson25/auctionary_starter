const e = require("express");
const bid = require('../models/bid.server.models');

const searchItems = () => {
  return fetch ("http://localhost:3333/search")
  .then((response) => {
    if (response.status === 200) {
      return response.json();
    }else {
      throw 'Something went wrong';
    }
  })
  .then((resJson) => {
    return resJson;
  })
  .catch((err) => {
    console.log("Err",err);
    return Promise.reject(err);

  })

}

const addItem = (req, res) => {
  const {title, description, starting_bid, auction_end, ...extraFields} = req.body ;
  if (Object.keys(extraFields).length > 0) {
    return res.status(400).json({error_message : "extra fields detected in request body."}); // Bad Request
  }
  if (!title) {
    return res.status(400).json({error_message : "title has not had data entered."}); // Bad Request
  }
  if (!description) {
    return res.status(400).json({error_message : "description has not had data entered."}); // Bad Request
  }
  if (!starting_bid) {
    return res.status(400).json({error_message : "starting bid has not had data entered."}); // Bad Request
  }
  if (!auction_end) {
    return res.status(400).json({error_message : "auction end has not had data entered."}); // Bad Request
  }
  
  const newItem = {
    title,
    description,
    starting_bid,
    auction_end
  };

  bid.addNewItem(newItem, (err,itemId) => {
    if (err) {
      console.error("Error adding new item:", err );
      return res.status(500).json({ error_message: "Internal server error" }); // Server Error
    }  
    return  res.status(201).json({ item_id: itemId }); // Created 
  });

}

const getItemDetails = (req, res) => {
    return fetch (`http://localhost:3333/item/${req.params.itemId}`)
    .then((response) => {
      if (response.status === 200) { 
        return response.json();
      }else {
        throw 'Something went wrong';
      }
    })
    .then((resJson) => {
      return resJson;
    })
    .catch((err) => {
      console.log("Err",err);
      return Promise.reject(err);
    });
}  

const addBid = (req, res) => {
    const {item_id, user_id, amount, ...extraFields} = req.body ;
    if (Object.keys(extraFields).length > 0) {
      return res.status(400).json({error_message : "extra fields detected in request body."}); // Bad Request
    }
    if (!item_id) {
      return res.status(400).json({error_message : "item id has not had data entered."}); // Bad Request
    }
    if (!user_id) {
      return res.status(400).json({error_message : "user id has not had data entered."}); // Bad Request
    }
    if (!amount) {
      return res.status(400).json({error_message : "amount has not had data entered."}); // Bad Request
    }   
    const newBid = {
      item_id,
      user_id,
      amount
    };
    bid.addNewBid(newBid, (err,bidId) => {
      if (err) {
        console.error("Error adding new bid:", err );
        return res.status(500).json({ error_message: "Internal server error" }); // Server Error
      }  
      return  res.status(201).json({ bid_id: bidId }); // Created 
    });
}

const getBidHistory = (req, res) => {
    return fetch (`http://localhost:3333/items/${req.params.itemId}/bids`)
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      }else {
        throw 'Something went wrong';
      }
    })
    .then((resJson) => {
      return resJson;
    })
    .catch((err) => {
      console.log("Err",err);
      return Promise.reject(err);

    })

}

module.exports = {
  searchItems: searchItems,
  addItem: addItem,
  getItemDetails: getItemDetails,
  addBid: addBid,
  getBidHistory: getBidHistory
};
exports.getCoreDetails = (req, res) => {
  res.status(200).json({ message: "Core controller is working" });
};


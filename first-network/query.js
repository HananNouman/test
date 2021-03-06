'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Chaincode query
 */

var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');

//
var fabric_client = new Fabric_Client();

// setup the fabric network
var channel = fabric_client.newChannel('mychannel');
console.log("hereeee")
var peer = fabric_client.newPeer('grpc://localhost:7051');
channel.addPeer(peer);

//
var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:'+store_path);
var tx_id = null;

// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {
	// assign the store to the fabric client
	fabric_client.setStateStore(state_store);
	var crypto_suite = Fabric_Client.newCryptoSuite();
	// use the same location for the state store (where the users' certificate are kept)
	// and the crypto store (where the users' keys are kept)
	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	crypto_suite.setCryptoKeyStore(crypto_store);
	fabric_client.setCryptoSuite(crypto_suite);

	// get the enrolled user from persistence, this user will sign all requests
	return fabric_client.getUserContext('user1', true);
	
}).then((user_from_store) => {
	if (user_from_store && user_from_store.isEnrolled()) {
		console.log('Successfully loaded user1 from persistence');
		member_user = user_from_store;
	} else {
		throw new Error('Failed to get user1.... run registerUser.js');
	}

	// queryCar chaincode function - requires 1 argument, ex: args: ['CAR4'],
	// queryAllCars chaincode function - requires no arguments , ex: args: [''],
	const request = {
		chaincodeId: 'mycc',
		fcn: 'lastAid',
		args: ['a']
	};

	// send the query proposal to the peer
	return channel.queryByChaincode(request);
}).then((query_responses) => {
	console.log("Query has completed, checking results");
	// query_responses could have more than one  results if there multiple peers were used as targets
	if (query_responses && query_responses.length == 1) {
		if (query_responses[0] instanceof Error) {
			console.log("user enrolled bushra")
			console.error("error from query = ", query_responses[0]);
		} else {
			console.log("Response is ", query_responses[0].toString());
		}
	} else {
		console.log("No payloads were returned from query");
	}
}).catch((err) => {
	console.error('Failed to query successfully :: ' + err);
});
/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
// var path = require('path');
// var fs = require('fs');
// var util = require('util');
// var hfc = require('fabric-client');
// var helper = require('./helper.js');
// var logger = helper.getLogger('Query');

// var queryChaincode = async function(peer, channelName, chaincodeName, args, fcn, username, org_name) {
// 	try {
// 		// first setup the client for this org
// 		var client = await helper.getClientForOrg(org_name, username);
// 		logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
// 		var channel = client.getChannel(channelName);
// 		if(!channel) {
// 			let message = util.format('Channel %s was not defined in the connection profile', channelName);
// 			logger.error(message);
// 			throw new Error(message);
// 		}

// 		// send query
// 		var request = {
// 			//targets : [peer], //queryByChaincode allows for multiple targets
// 			chaincodeId: chaincodeName,
// 			fcn: fcn,
// 			args: args
// 		};
// 		let response_payloads = await channel.queryByChaincode(request);
// 		if (response_payloads) {
// 			for (let i = 0; i < response_payloads.length; i++) {
// 				logger.info(args[0]+' now has ' + response_payloads[i].toString('utf8') +
// 					' after the move');
// 			}
// 			return args[0]+' now has ' + response_payloads[0].toString('utf8') +
// 				' after the move';
// 		} else {
// 			logger.error('response_payloads is null');
// 			return 'response_payloads is null';
// 		}
// 	} catch(error) {
// 		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
// 		return error.toString();
// 	}
// };
// // var getBlockByNumber = async function(peer, channelName, blockNumber, username, org_name) {
// // 	try {
// // 		// first setup the client for this org
// // 		var client = await helper.getClientForOrg(org_name, username);
// // 		logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
// // 		var channel = client.getChannel(channelName);
// // 		if(!channel) {
// // 			let message = util.format('Channel %s was not defined in the connection profile', channelName);
// // 			logger.error(message);
// // 			throw new Error(message);
// // 		}

// // 		let response_payload = await channel.queryBlock(parseInt(blockNumber, peer));
// // 		if (response_payload) {
// // 			logger.debug(response_payload);
// // 			return response_payload;
// // 		} else {
// // 			logger.error('response_payload is null');
// // 			return 'response_payload is null';
// // 		}
// // 	} catch(error) {
// // 		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
// // 		return error.toString();
// // 	}
// // };
// // var getTransactionByID = async function(peer, channelName, trxnID, username, org_name) {
// // 	try {
// // 		// first setup the client for this org
// // 		var client = await helper.getClientForOrg(org_name, username);
// // 		logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
// // 		var channel = client.getChannel(channelName);
// // 		if(!channel) {
// // 			let message = util.format('Channel %s was not defined in the connection profile', channelName);
// // 			logger.error(message);
// // 			throw new Error(message);
// // 		}

// // 		let response_payload = await channel.queryTransaction(trxnID, peer);
// // 		if (response_payload) {
// // 			logger.debug(response_payload);
// // 			return response_payload;
// // 		} else {
// // 			logger.error('response_payload is null');
// // 			return 'response_payload is null';
// // 		}
// // 	} catch(error) {
// // 		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
// // 		return error.toString();
// // 	}
// // };
// // var getBlockByHash = async function(peer, channelName, hash, username, org_name) {
// // 	try {
// // 		// first setup the client for this org
// // 		var client = await helper.getClientForOrg(org_name, username);
// // 		logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
// // 		var channel = client.getChannel(channelName);
// // 		if(!channel) {
// // 			let message = util.format('Channel %s was not defined in the connection profile', channelName);
// // 			logger.error(message);
// // 			throw new Error(message);
// // 		}

// // 		let response_payload = await channel.queryBlockByHash(Buffer.from(hash), peer);
// // 		if (response_payload) {
// // 			logger.debug(response_payload);
// // 			return response_payload;
// // 		} else {
// // 			logger.error('response_payload is null');
// // 			return 'response_payload is null';
// // 		}
// // 	} catch(error) {
// // 		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
// // 		return error.toString();
// // 	}
// // };
// // var getChainInfo = async function(peer, channelName, username, org_name) {
// // 	try {
// // 		// first setup the client for this org
// // 		var client = await helper.getClientForOrg(org_name, username);
// // 		logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
// // 		var channel = client.getChannel(channelName);
// // 		if(!channel) {
// // 			let message = util.format('Channel %s was not defined in the connection profile', channelName);
// // 			logger.error(message);
// // 			throw new Error(message);
// // 		}

// // 		let response_payload = await channel.queryInfo(peer);
// // 		if (response_payload) {
// // 			logger.debug(response_payload);
// // 			return response_payload;
// // 		} else {
// // 			logger.error('response_payload is null');
// // 			return 'response_payload is null';
// // 		}
// // 	} catch(error) {
// // 		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
// // 		return error.toString();
// // 	}
// // };
// // //getInstalledChaincodes
// // var getInstalledChaincodes = async function(peer, channelName, type, username, org_name) {
// // 	try {
// // 		// first setup the client for this org
// // 		var client = await helper.getClientForOrg(org_name, username);
// // 		logger.debug('Successfully got the fabric client for the organization "%s"', org_name);

// // 		let response = null
// // 		if (type === 'installed') {
// // 			response = await client.queryInstalledChaincodes(peer, true); //use the admin identity
// // 		} else {
// // 			var channel = client.getChannel(channelName);
// // 			if(!channel) {
// // 				let message = util.format('Channel %s was not defined in the connection profile', channelName);
// // 				logger.error(message);
// // 				throw new Error(message);
// // 			}
// // 			response = await channel.queryInstantiatedChaincodes(peer, true); //use the admin identity
// // 		}
// // 		if (response) {
// // 			if (type === 'installed') {
// // 				logger.debug('<<< Installed Chaincodes >>>');
// // 			} else {
// // 				logger.debug('<<< Instantiated Chaincodes >>>');
// // 			}
// // 			var details = [];
// // 			for (let i = 0; i < response.chaincodes.length; i++) {
// // 				logger.debug('name: ' + response.chaincodes[i].name + ', version: ' +
// // 					response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
// // 				);
// // 				details.push('name: ' + response.chaincodes[i].name + ', version: ' +
// // 					response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
// // 				);
// // 			}
// // 			return details;
// // 		} else {
// // 			logger.error('response is null');
// // 			return 'response is null';
// // 		}
// // 	} catch(error) {
// // 		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
// // 		return error.toString();
// // 	}
// // };
// // var getChannels = async function(peer, username, org_name) {
// // 	try {
// // 		// first setup the client for this org
// // 		var client = await helper.getClientForOrg(org_name, username);
// // 		logger.debug('Successfully got the fabric client for the organization "%s"', org_name);

// // 		let response = await client.queryChannels(peer);
// // 		if (response) {
// // 			logger.debug('<<< channels >>>');
// // 			var channelNames = [];
// // 			for (let i = 0; i < response.channels.length; i++) {
// // 				channelNames.push('channel id: ' + response.channels[i].channel_id);
// // 			}
// // 			logger.debug(channelNames);
// // 			return response;
// // 		} else {
// // 			logger.error('response_payloads is null');
// // 			return 'response_payloads is null';
// // 		}
// // 	} catch(error) {
// // 		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
// // 		return error.toString();
// // 	}
// // };
// queryChaincode(null,"mychannel","mycc",['a'],"query","user1","org1")
// exports.queryChaincode = queryChaincode;
// exports.getBlockByNumber = getBlockByNumber;
// exports.getTransactionByID = getTransactionByID;
// exports.getBlockByHash = getBlockByHash;
// exports.getChainInfo = getChainInfo;
// exports.getInstalledChaincodes = getInstalledChaincodes;
// exports.getChannels = getChannels;
'use strict';
// Repo-local Realiti 1.0 entry. No new physics or NeuralMesh instance.
const {createNativeInhabited}=require('../../v20/native-inhabited.cjs');
const {createNyxObservationPort}=require('./nyx-observer.cjs');
module.exports=Object.freeze({createNativeInhabited,createNyxObservationPort});

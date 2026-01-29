import mongoose from "mongoose";

const vehicleRecordSchema = new mongoose.Schema({
    passId:{
        type:String,
        required:true,
        unique:true
    },
    data:{
        type:Date,
        required:true
    },
    time:{
        type:String, // e.g., "14:30"
        required:true
    },
    vehcleNumber:{
        type:String,
        required:true   
    },
    vehicleType:{
        type:String,
        required:true
    },
    driverName:{
        type:String,
        required:true
    },
    purpose:{
        type:String,
        required:true
    },
    to:{
        type:String,
        required:true
    },
    bringItems:{
        type:String,
    },
    outTime:{
        type:String // e.g., "16:30"
    },
    inTime:{
        type:String // e.g., "18:30"        
    },
    approvalStatus:[{
        recommenderName:{
            type:String,
            required:true
        },
        recommenderDesignation:{
            type:String,
            required:true
        }
    }]        

})

const VehicleRecord = mongoose.model('VehicleRecord',vehicleRecordSchema);
export default VehicleRecord;
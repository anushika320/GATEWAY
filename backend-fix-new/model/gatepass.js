import mongoose from "mongoose";


const gatePassSchema = new mongoose.Schema({
    passId:{
        type:String,
        unique:true,
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    vehicleNumber:{
        type:String,
        required:true
    },
    department:{
        type:String,
        required:true
    },
    from:{
        type:String,
        required:true   
    },
    to:{
        type:String,
        required:true
    },
    items:{
        type:String,
        required:true
    },
    approvalStatus:[{
        recommenderName:{
            type:String,
            required:true
        },
        recommenderDesignation:{
            type:String,
            required:true
        },
        recommendDate:{
            type:Date,
            required:true   
        },
        recommendTime:{
            type:String ,// e.g., "14:30"
            required:true
        },
        status:{            
            type:String,
            enum:['pending','approved','rejected'],
            default:'pending'   
        }
        }]
})

const GatePass = mongoose.model('GatePass',gatePassSchema);
export default GatePass;
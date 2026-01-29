import GatePass from "../model/gatepass.js";

export async function createGatePass(req, res) {
  if (req.user.role == "admin") {
    console.log("createGatePass body:", req.body);

    if (!req.body) {
      return res.status(400).json({
        message:
          "Request body missing or not parsed. Set Content-Type: application/json",
      });
    }

    const required = [
      "passId",
      "date",
      "vehicleNumber",
      "department",
      "from",
      "to",
      "items",
      "approvalStatus",
    ];
    const missing = required.filter(
      (k) =>
        !(k in req.body) ||
        req.body[k] === undefined ||
        req.body[k] === null ||
        req.body[k] === ""
    );

    if (missing.length) {
      return res
        .status(400)
        .json({ message: "Missing required fields", missing });
    }

    try {
      const gatePass = new GatePass({
        passId: req.body.passId,
        date: req.body.date,
        vehicleNumber: req.body.vehicleNumber,
        department: req.body.department,
        from: req.body.from,
        to: req.body.to,
        items: req.body.items,
        approvalStatus: req.body.approvalStatus,
      });

      await gatePass.save();
      return res
        .status(201)
        .json({ message: "Gate pass created successfully" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Failed to create gate pass", error: err.message });
    }
  } else {
    console.log("here");
    res.status(403).json({
      message: "You are not authorized to Create gate passes",
    });
  }
}
// ...existing code...
/*
export  function createGatePass(req,res){
    try{ 
    
         
            const gatePass = new GatePass({
                passId : req.body.passId,
                date : req.body.date,
                vehicleNumber : req.body.vehicleNumber,
                department : req.body.department,
                from : req.body.from,
                to : req.body.to,
                items : req.body.items,
                approvalStatus : req.body.approvalStatus

            })
           gatePass.save().then(()=>{
                res.status(201).json({
                    message:"Gate pass created successfully"
                })
           })
        
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message:"Failed to create gate pass1"
        })
    }
        
    
    
}*/

export async function viewAllGatePass(req, res) {
  try {
    if (req.user.role == "admin") {
      const pass = await GatePass.find();

      if (pass == null) {
        res.status(404).json({
          message: "No gate passes found",
        });
        return;
      }
      res.json(pass);
    } else {
      console.log("here");
      res.status(403).json({
        message: "You are not authorized to view all gate passes",
      });
    }
  } catch {
    res.status(500).json({
      message: "Failed to View Pass",
    });
  }
}

export async function viewGatePassById(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // only admins allowed (adjust logic if regular users should view their own passes)
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this gate pass" });
    }

    const passId = req.params.passId;
    if (!passId) {
      return res.status(400).json({ message: "passId parameter is required" });
    }

    const pass = await GatePass.findOne({ passId: passId });
    if (!pass) {
      return res.status(404).json({ message: "No gate pass found" });
    }

    return res.status(200).json(pass);
  } catch (err) {
    console.error("viewGatePassById error:", err);
    return res
      .status(500)
      .json({ message: "Failed to view pass", error: err.message });
  }
}

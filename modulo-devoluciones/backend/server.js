const express = require("express")
const mysql = require("mysql2")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
 host:"localhost",
 user:"root",
 password:"Thebeatles1995*",
 database:"dulceria_lupitabd"
})

db.connect(err=>{
 if(err){
  console.log("Error de conexión")
 }else{
  console.log("Conectado a MySQL")
 }
})

app.get("/",(req,res)=>{
 res.send("Servidor funcionando correctamente")
})


app.post("/devoluciones",(req,res)=>{

 const {proveedor_id,producto_id,cantidad,motivo,sucursal,usuario_id} = req.body

 const sql = `
 INSERT INTO devoluciones
 (folio,proveedor_id,producto_id,cantidad,motivo,sucursal,usuario_id,estado,fecha)
 VALUES (UUID(),?,?,?,?,?,?,'Registrada',NOW())
 `

 db.query(sql,[proveedor_id,producto_id,cantidad,motivo,sucursal,usuario_id],(err,result)=>{

  if(err){
   console.log(err)
   res.status(500).send(err.sqlMessage)
  }else{
   res.send("Devolución registrada correctamente")
  }

 })

})



app.get("/devoluciones",(req,res)=>{

 const sql = `
 SELECT 
 d.id,
 d.folio,
 p.Nombre AS proveedor,
 pr.Nombre AS producto,
 d.cantidad,
 d.motivo,
 d.sucursal,
 u.Nombre AS usuario,
 d.estado,
 d.fecha
 FROM devoluciones d
 JOIN proveedores p ON d.proveedor_id = p.ID_proveedor
 JOIN productos pr ON d.producto_id = pr.ID_producto
 JOIN usuarios u ON d.usuario_id = u.ID_usuario
 ORDER BY d.fecha DESC
 `

 db.query(sql,(err,result)=>{

  if(err){
   console.log(err)
   res.send("Error al consultar")
  }else{
   res.json(result)
  }

 })

})



app.put("/devoluciones/:id",(req,res)=>{

 const {estado} = req.body
 const {id} = req.params

 const sql = "UPDATE devoluciones SET estado=? WHERE id=?"

 db.query(sql,[estado,id],(err,result)=>{

  if(err){
   res.send("Error al actualizar")
  }else{
   res.send("Estado actualizado")
  }

 })

})


app.delete("/devoluciones/:id", (req, res) => {

  const id = req.params.id;

  const obtener = "SELECT producto_id, cantidad FROM devoluciones WHERE id = ?";

  db.query(obtener, [id], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).send("Error al buscar devolución");
    }

    if (result.length === 0) {
      return res.send("No existe la devolución");
    }

    const producto_id = result[0].producto_id;
    const cantidad = result[0].cantidad;

    const devolverStock = `
      UPDATE productos 
      SET Stock_anual = Stock_anual + ? 
      WHERE ID_producto = ?
    `;

    db.query(devolverStock, [cantidad, producto_id], (err) => {

      if (err) {
        console.log(err);
        return res.status(500).send("Error al devolver stock");
      }

      const eliminar = "DELETE FROM devoluciones WHERE id = ?";

      db.query(eliminar, [id], (err) => {

        if (err) {
          console.log(err);
          res.status(500).send("Error al eliminar");
        } else {
          res.send("Devolución eliminada y stock restaurado");
        }

      });

    });

  });

});


app.listen(3001,()=>{
 console.log("Servidor corriendo en puerto 3001")
})
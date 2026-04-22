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



app.get("/usuarios",(req,res)=>{
  db.query("SELECT ID_usuario, Nombre FROM usuarios",(err,result)=>{
    if(err) return res.send("Error usuarios")
    res.json(result)
  })
})

app.get("/proveedores",(req,res)=>{
  db.query("SELECT ID_proveedor, Nombre FROM proveedores",(err,result)=>{
    if(err) return res.send("Error proveedores")
    res.json(result)
  })
})

app.get("/productos",(req,res)=>{
  db.query("SELECT ID_producto, Nombre, Stock_anual FROM productos",(err,result)=>{
    if(err) return res.send("Error productos")
    res.json(result)
  })
})

app.get("/sucursal",(req,res)=>{
  db.query("SELECT ID_sucursal, Nombre FROM sucursal",(err,result)=>{
    if(err) return res.send("Error sucursal")
    res.json(result)
  })
})

app.post("/devoluciones",(req,res)=>{

  const {proveedor_id,producto_id,cantidad,motivo,sucursal,usuario_id} = req.body


  if(!proveedor_id || !producto_id || !cantidad || !motivo || !sucursal || !usuario_id){
    return res.status(400).send("Faltan datos")
  }


  const verificarStock = "SELECT Stock_anual FROM productos WHERE ID_producto = ?"

  db.query(verificarStock,[producto_id],(err,result)=>{

    if(err){
      console.log(err)
      return res.status(500).send("Error al verificar stock")
    }

    if(result.length === 0){
      return res.send("Producto no encontrado")
    }

    const stock = result[0].Stock_anual

    if(cantidad > stock){
      return res.status(400).send("La cantidad supera el stock disponible")
    }

    
    const sql = `
    INSERT INTO devoluciones
    (folio,proveedor_id,producto_id,cantidad,motivo,sucursal,usuario_id,estado,fecha)
    VALUES (UUID(),?,?,?,?,?,?,'Registrada',NOW())
    `

    db.query(sql,[proveedor_id,producto_id,cantidad,motivo,sucursal,usuario_id],(err)=>{

      if(err){
        console.log(err)
        return res.status(500).send(err.sqlMessage)
      }

     
      const actualizarStock = `
        UPDATE productos 
        SET Stock_anual = Stock_anual - ?
        WHERE ID_producto = ?
      `

      db.query(actualizarStock,[cantidad,producto_id],(err)=>{
        if(err){
          console.log(err)
          return res.status(500).send("Error al actualizar stock")
        }

        res.send("Devolución registrada correctamente")
      })

    })

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
  DATE_FORMAT(d.fecha, '%Y-%m-%d') AS fecha
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

  db.query("UPDATE devoluciones SET estado=? WHERE id=?",[estado,id],(err)=>{
    if(err){
      res.send("Error al actualizar")
    }else{
      res.send("Estado actualizado")
    }
  })

})



app.delete("/devoluciones/:id",(req,res)=>{

  const id = req.params.id

  const obtener = "SELECT producto_id, cantidad FROM devoluciones WHERE id=?"

  db.query(obtener,[id],(err,result)=>{

    if(err){
      console.log(err)
      return res.status(500).send("Error")
    }

    if(result.length === 0){
      return res.send("No existe")
    }

    const {producto_id,cantidad} = result[0]

    const devolverStock = `
      UPDATE productos 
      SET Stock_anual = Stock_anual + ?
      WHERE ID_producto = ?
    `

    db.query(devolverStock,[cantidad,producto_id],(err)=>{

      if(err){
        console.log(err)
        return res.status(500).send("Error stock")
      }

      db.query("DELETE FROM devoluciones WHERE id=?",[id],(err)=>{

        if(err){
          res.status(500).send("Error eliminar")
        }else{
          res.send("Eliminado correctamente")
        }

      })

    })

  })

})

app.listen(3001,()=>{
  console.log("Servidor corriendo en puerto 3001")
})


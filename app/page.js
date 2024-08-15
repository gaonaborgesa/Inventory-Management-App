'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import {firestore} from '@/firebase'
import { Box, Modal, Typography, Stack, TextField, Button } from "@mui/material";
import { collection, deleteDoc, doc, getDocs, query, setDoc, getDoc } from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}



export default function Home() {
  const [inventory, setInventory] = useState([]) // to add and remove stuff? - empty list
  const [open, setOpen] = useState(false) 
  const [itemName, setItemName] = useState('') // store name of the item user types - empty string


// first function - Implement inventory fetching - updates firebase aka database
  const updateInventory = async () => { // async means it wont freeze while fetching
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ 
        name: doc.id, ...doc.data() 
      })
    })
    setInventory(inventoryList)
  }


// Implement add and remove functions

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }

    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data() // getting quantity from data
      if (quantity === 1) {
        await deleteDoc(docRef) // if equal to 1 then delete
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }) // doesnt exist then do nothing
      }
    }
    await updateInventory()
  }
  
  useEffect(() => { //runs code when array changes aka only once when it loads
    updateInventory()
  }, []) // array

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)


  return (
    // BOX - flex container to center our content
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'} 
      alignItems={'center'}
      gap={2}
    >
      <Modal // contains a form for adding new items - uses `open` state to control its visibility
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}> 
        Add New Item
      </Button>
      <Box border={'1px solid #333'}> 
        <Box // main inventory display
          width="800px"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
          {inventory.map(({name, quantity}) => ( 
        // use Stack component to create scrollable list of inventory items
        // Each item is displayed in its own `Box`    
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={'flex'} // centers stufff
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5} // space around text
            >

              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                Quantity: {quantity}
              </Typography>             
              
              <Stack direction="row" spacing={2}> 
                <Button
                  variant="contained"
                  onClick={() => {
                    addItem(name)
                  }}
                >
                  Add
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    removeItem(name)
                  }}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

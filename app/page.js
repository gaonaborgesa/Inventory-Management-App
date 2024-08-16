'use client';

import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Modal, Typography, Stack, TextField, Button } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, query, setDoc, getDoc } from 'firebase/firestore';
import { Search as SearchIcon } from '@mui/icons-material';

// Define styles in a separate constant
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#ffffff',
  borderRadius: 8,
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};


const inventoryItemStyle = {
  borderRadius: 8,
  bgcolor: '#f9f9f9',
  padding: 2,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'background-color 0.3s',
  '&:hover': {
    bgcolor: '#e0e0e0',
  },
};


// Main component function
export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query


  // Fetch inventory data from Firestore
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = docs.docs.map(doc => ({ name: doc.id, ...doc.data() }));
    setInventory(inventoryList);
  };

  // Add an item to the inventory
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory();
  };

  // Remove an item from the inventory
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  // Handlers for modal state
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addItem(itemName);
      setItemName('');
      handleClose();
    }
  };

// Filter inventory based on search 
const filteredInventory = inventory.filter(({ name }) =>
  name.toLowerCase().includes(searchQuery.toLowerCase())
);


  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      gap={3}
      bgcolor="#f4f6f8"
      p={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              id="item-input"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              variant="contained"
              color='primary'
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add New Item
      </Button>


      <TextField
        id="search-bar"
        label="Search Inventory"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon />,
        }}
        sx={{ width: '800px', marginBottom: 1 }}
      />

      <Box
        width="800px"
        borderRadius={8}
        bgcolor="#ffffff"
        boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
        overflow="hidden"
      >
        <Box
          width="100%"
          height="100px"
          bgcolor="#007bff"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h4" color="#ffffff" textAlign="center">
            Inventory Items
          </Typography>
        </Box>
        <Stack width="100%" spacing={2} maxHeight="300px" overflow="auto" p={2} pb={6}>
          {filteredInventory.length > 0 ? (
            filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              sx={inventoryItemStyle}
            >
              <Typography variant="h6">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h6">
                Quantity: {quantity}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => addItem(name)}
                >
                  Add
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => removeItem(name)}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))
        ) : (
          <Typography variant="h6" color="textSecondary" align="center">
            No matches found.
          </Typography>
        )}

        </Stack>
      </Box>
    </Box>
  );
}

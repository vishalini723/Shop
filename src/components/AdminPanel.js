import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [newCoins, setNewCoins] = useState({});
  const [usernameToDelete, setUsernameToDelete] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [filteredUsers, setFilteredUsers] = useState([]); // State for filtered users


  const [shops, setShops] = useState([]);
  const [newShop, setNewShop] = useState({ shopName: '', shopOwner: '' });
  const [selectedShop, setSelectedShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ productName: '', price: '', quantity: '' });

  // useEffect(() => {
  //   // Fetch users when component mounts
  //   axios.get('http://localhost:5000/api/admin/getUsers')
  //     .then(response => {
  //       if (response.data.success) {
  //         setUsers(response.data.users);
  //         setFilteredUsers(response.data.users); // Initially, all users are shown
  //       } else {
  //         alert('Failed to load users');
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Error fetching users:', error);
  //       alert('Failed to load users');
  //     });
  // }, []);



  // Fetch users and shops when component mounts
  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/getUsers')
      .then(response => {
        if (response.data.success) {
          setUsers(response.data.users);
          setFilteredUsers(response.data.users); // Initially, all users are shown
        } else {
          alert('Failed to load users');
        }
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        alert('Failed to load users');
      });

    axios.get('http://localhost:5000/api/admin/getShops')
      .then(response => {
        if (response.data.success) {
          setShops(response.data.shops);
        } else {
          alert('Failed to load shops');
        }
      })
      .catch(error => {
        console.error('Error fetching shops:', error);
        alert('Failed to load shops');
      });
  }, []);


  // Update filtered users based on search term
  useEffect(() => {
    // Convert searchTerm to a number to ensure matching works correctly
    const searchId = parseInt(searchTerm, 10);

    // Filter users based on whether the searchTerm is a valid 12-digit userId
    if (!isNaN(searchId) && searchTerm.length === 12) {
      setFilteredUsers(
        users.filter(user => user.userId === searchTerm || user.userId === searchId)
      );
    } else {
      setFilteredUsers(users); // Show all users if search term is empty or invalid
    }
  }, [searchTerm, users]);

  const handleCoinChange = (username, event) => {
    setNewCoins({
      ...newCoins,
      [username]: event.target.value
    });
  };

  const saveCoins = (username) => {
    const addedCoins = parseInt(newCoins[username] || 0);

    if (isNaN(addedCoins) || addedCoins <= 0) {
      alert('Please enter a valid coin value greater than 0.');
      return;
    }

    axios.post('http://localhost:5000/api/admin/updateUserCoins', {
      username,
      newCoins: addedCoins
    })
    .then((response) => {
      if (response.data.success) {
        alert('Coins updated successfully!');
        setUsers(users.map(user =>
          user.username === username
            ? { ...user, coins: user.coins + addedCoins }
            : user
        ));
        setNewCoins({ ...newCoins, [username]: '' }); // Clear the input field after updating
      } else {
        alert(response.data.message);
      }
    })
    .catch((error) => {
      console.error('Error updating coins:', error);
      alert('Error updating coins');
    });
  };

  const handleDeleteUser = () => {
    if (!usernameToDelete) {
      alert('Please enter a username to delete');
      return;
    }

    axios.post('http://localhost:5000/api/admin/deleteUser', {
      username: usernameToDelete
    })
    .then((response) => {
      if (response.data.success) {
        alert('User deleted successfully!');
        // Remove user from the frontend list
        setUsers(users.filter(user => user.username !== usernameToDelete));
        setUsernameToDelete(''); // Clear the input after deletion
      } else {
        alert(response.data.message);
      }
    })
    .catch((error) => {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    });
  };




  // Handle new shop data changes
  const handleShopChange = (field, value) => {
    setNewShop({ ...newShop, [field]: value });
  };

  // Save new shop to the backend
  const addShop = () => {
    if (!newShop.shopName || !newShop.shopOwner) {
      alert('Please enter both shop name and shop owner.');
      return;
    }

    axios.post('http://localhost:5000/api/admin/addShop', newShop)
      .then(response => {
        if (response.data.success) {
          alert('Shop added successfully!');
          setShops([...shops, newShop]);
          setNewShop({ shopName: '', shopOwner: '' }); // Clear input fields
        } else {
          alert('Failed to add shop');
        }
      })
      .catch(error => {
        console.error('Error adding shop:', error);
        alert('Error adding shop');
      });
  };

  const addProduct = () => {
    if (!newProduct.productName || !newProduct.price || !newProduct.quantity) {
      alert('Please complete all product fields.');
      return;
    }

    axios.post('http://localhost:5000/api/admin/addProduct', { shopName: selectedShop, ...newProduct })
      .then(response => {
        if (response.data.success) {
          alert('Product added successfully!');
          setProducts([...products, newProduct]);
          setNewProduct({ productName: '', price: '', quantity: '' });
        }
      });
  };


  // Function to delete a product
  const deleteProduct = (productName) => {
    if (!selectedShop) {
      alert('Please select a shop first.');
      return;
    }

    console.log("Attempting to delete product:", { shopName: selectedShop, productName }); // Log data

    axios.post('http://localhost:5000/api/admin/deleteProduct', { shopName: selectedShop, productName })
      .then(response => {
        if (response.data.success) {
          alert('Product deleted successfully!');
          setProducts(products.filter(product => product.productName !== productName));
        } else {
          alert(response.data.message || 'Failed to delete product');
        }
      })
      .catch(error => {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      });
  };








  
  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
    axios.post('http://localhost:5000/api/admin/getProducts', { shopName: shop })
      .then(response => {
        if (response.data.success) setProducts(response.data.products);
      });
  };
  return (
    <div>
      <h1>Admin Panel</h1>

      {/* Search input for filtering users by userId */}
      <input
        type="text"
        placeholder="Search user by 12-digit userId"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <h2>Update Coins</h2>
      <table>
        <thead>
          <tr className='justify-around'>
            <th className='text-red-500'>Username</th>
            <th className='text-red-500'>User ID</th>
            <th className='text-red-500 pl-20'>Current Coins</th>
            <th className='text-red-500'>Add Coins</th>
            <th className='text-red-500'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.username} style={{ backgroundColor: user.userId === searchTerm ? '#e0f7fa' : 'transparent' }}>
              <td>{user.username}</td>
              <td >{user.userId}</td>
              <td className='pl-20'>{user.coins}</td>
              <td>
                <input
                  type="number"
                  value={newCoins[user.username] || ''}
                  onChange={(event) => handleCoinChange(user.username, event)}
                />
              </td>
              <td>
                <button onClick={() => saveCoins(user.username)}>Save Changes</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      Shop Management Section
      <h2>Manage Shops</h2>
      <input
        type="text"
        placeholder="Shop Name"
        value={newShop.shopName}
        onChange={(e) => handleShopChange('shopName', e.target.value)}
      />
      <input
        type="text"
        placeholder="Shop Owner"
        value={newShop.shopOwner}
        onChange={(e) => handleShopChange('shopOwner', e.target.value)}
      />
      <button onClick={addShop}>Add Shop</button>

  
      {/* Shop Selection */}
      <h2>Select Shop</h2>
      <select onChange={(e) => handleShopSelect(e.target.value)} value={selectedShop || ''}>
        <option value="" disabled>Select a shop</option>
        {shops.map(shop => <option key={shop.shopName} value={shop.shopName}>{shop.shopName}</option>)}
      </select>

      {/* Product Management for Selected Shop */}
      {selectedShop && (
        <div>
          <h2>Manage Products for {selectedShop}</h2>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.productName}>
                  <td>{product.productName}</td>
                  <td>{product.price}</td>
                  <td>{product.quantity}</td>
                  <td>
                    <button onClick={() => deleteProduct(product.productName)}>Delete</button> 
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add New Product */}
          <h3>Add New Product</h3>
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.productName}
            onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newProduct.quantity}
            onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
          />
          <button onClick={addProduct}>Add Product</button>
        </div>

            )}


    </div>
  );
};

export default AdminPanel;
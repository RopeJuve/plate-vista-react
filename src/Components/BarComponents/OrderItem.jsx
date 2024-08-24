
const OrderItem = ({ item}) => {
    return (
      <div>
       {    item.menuItems.map((menuItem) => (
              <li key={menuItem._id}>
                {menuItem.product.title} (x{menuItem.quantity}) - $
                {menuItem.product.price}
              </li>
            ))}
      </div>
    )
  }
  
  export default OrderItem
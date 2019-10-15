import React, { Component } from "react";
// import items from "./data";

import Client from "./Contentful";

// Client.getEntries({
//   content_type: "resortRooms"
// })
//   .then(response => console.log(response.items))
//   .catch(console.error);

const RoomContext = React.createContext();

class RoomProvider extends Component {
  state = {
    rooms: [],
    sortedRooms: [],
    featuredRooms: [],
    loading: true,
    type: "all",
    capacity: 1,
    price: 0,
    minPrice: 0,
    maxPrice: 0,
    minSize: 0,
    maxSize: 0,
    breakfast: false,
    pets: false
  };

  //getData from Contentful
  getData = async () => {
    try {
      let response = await Client.getEntries({
        content_type: "resortRooms",
        //order: "sys.createdAt"
        //order:"-fields.price" : reverse order
        order: "fields.price"
      });
      let rooms = this.formatData(response.items);
      //console.log(rooms);
      let featuredRooms = rooms.filter(room => room.featured === true);
      //console.log(featuredRooms);
      let maxPrice = Math.max(...rooms.map(item => item.price));
      let maxSize = Math.max(...rooms.map(item => item.size));
      this.setState({
        rooms,
        sortedRooms: rooms,
        featuredRooms,
        loading: false,
        price: maxPrice,
        maxPrice,
        maxSize
      });
    } catch (error) {
      console.log(error);
    }
  };

  componentDidMount() {
    this.getData();
  }

  formatData(items) {
    let tempItems = items.map(item => {
      let id = item.sys.id;
      let images = item.fields.images.map(image => {
        return image.fields.file.url;
      });

      let room = { ...item.fields, images, id };
      return room;
    });
    return tempItems;
  }

  getRoom = slug => {
    const tempRooms = [...this.state.rooms];
    const room = tempRooms.find(room => room.slug === slug);
    return room;
  };

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    //console.log(value, name);
    this.setState(
      {
        [name]: value
      },
      this.filterRooms
    );
  };

  filterRooms = () => {
    // console.log(this.state.type);
    //viet did
    // const tempRooms = [...this.state.rooms];
    // const sortedRooms = tempRooms.filter(item => {
    //   if (this.state.type === "all") {
    //     return item;
    //   }
    //   return item.type === this.state.type;
    // });
    // this.setState({
    //   sortedRooms
    // });

    let {
      rooms,
      type,
      capacity,
      price,
      minSize,
      maxSize,
      breakfast,
      pets
    } = this.state;

    //filter for type:
    let tempRooms = [...rooms];
    if (type !== "all") {
      tempRooms = tempRooms.filter(item => item.type === type);
    }

    //filter of capacity:
    capacity = parseInt(capacity);
    tempRooms = tempRooms.filter(item => item.capacity >= capacity);

    //filter of price
    price = parseInt(price);
    tempRooms = tempRooms.filter(item => item.price <= price);

    //filter of size
    tempRooms = tempRooms.filter(item => {
      return item.size >= minSize && item.size <= maxSize;
    });

    //filter of breakfast
    if (breakfast) {
      tempRooms = tempRooms.filter(item => item.breakfast === true);
    }

    //filter of pets
    if (pets) {
      tempRooms = tempRooms.filter(item => item.pets === true);
    }

    this.setState({
      sortedRooms: tempRooms
    });
  };

  render() {
    return (
      <RoomContext.Provider
        value={{
          ...this.state,
          getRoom: this.getRoom,
          handleChange: this.handleChange
        }}
      >
        {this.props.children}
      </RoomContext.Provider>
    );
  }
}

const RoomConsumer = RoomContext.Consumer;

export function withRoomConsumer(Component) {
  return function ConsumerWrapper(props) {
    return (
      <RoomConsumer>
        {value => <Component {...props} context={value} />}
      </RoomConsumer>
    );
  };
}

export { RoomContext, RoomConsumer, RoomProvider };

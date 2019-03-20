//LIBRARIES/DEPENDENCIES
import React, { Component } from 'react';
import Particles from 'react-particles-js';

import './App.css';

//COMPONENTS
import Navigation from '../Components/Navigation/navigation';
import Logo from '../Components/Logo/logo';
import ImageLinkForm from '../Components/ImageLink/imagelink';
import Rank from '../Components/Rank/rank';
import FaceRecognition from '../Components/FaceRecognition/facerecognition';
import SignIn from '../Components/SignIn/signin';
import Register from '../Components/Register/register';


 //PARTICLES SETUP
const particleOptions= {
   particles: {
    number:{ value: 350,
      density:{ enable: true, value_area: 650}},
    color: <div id="ffffff"></div>,
    move: {
      enable: true,
      direction: 'bottom-right',
      out_mode: 'out'
    }
   }
  }

const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
}
//APP WITH STATE
class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }
    })
  }

  //CREATES BOX 
  getFaceLocation = (data) => {
    const face = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: face.left_col * width,
      topRow: face.top_row * height,
      rightCol: width - (face.right_col * width),
      bottomRow: height - (face.bottom_row * height)
    }
  }

  //FILL BOX STATE WITH BOX VALUES
  displayBox = (box) => {
    this.setState({box: box});
  }

  //INPUT BOX FUNCTIONALITY
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  //BUTTON FUNCTIONALITY WITH API
  onButtonClick = () => {
    this.setState({imageUrl :this.state.input});
      fetch('https://fast-headland-80560.herokuapp.com/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        if(response){
          fetch('https://fast-headland-80560.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
            id: this.state.user.id,
            
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
        })
        .catch(console.log)
      }
      this.displayBox(this.getFaceLocation(response))
      })
    .catch(err => console.log(err));
  }

  //CHANGES TO SCREENS DEPENDING ON WHAT IS CLICKED
  onRouteChange = (route) => {
    if (route === 'signout'){
      this.setState(initialState)
    }else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  

  //RENDER FUNCTION WITH COMPONENTS DISPLAYED
  render() {
    const { isSignedIn,imageUrl, box, route } = this.state;
    return (
      <div className="App">
        <Particles className='particles' params={particleOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange = {this.onRouteChange} />
        {route  === 'home' 
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm 
                onInputChange = {this.onInputChange}
                onButtonClick = {this.onButtonClick} />
              <FaceRecognition 
                imageUrl = {imageUrl}
                box={box}/>
            </div>
          : (
            route === 'signin'
            ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )

        }   
      </div>
    );
  }
}

export default App;

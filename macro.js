const xapi = require('xapi');
var payload;

const MERAKI_KEY = "74d23386bdfb4ea9f3317b534119783d96ebeee9"; // Fill in Cisco Meraki Dashboard API key
const MERAKI_URL = "https://n66.meraki.com" // Fill in first part of the Meraki Dashboard URL (e.g. https://n60.meraki.com)
const SSID_NUMBER = "1" // Fill in SSID number
const NETWORK_ID = "L_600104650347133228" // Fill in network ID
const SSID_NAME = "Guest-Wifi-test" // Fill in SSID name


function updateMerakiSSID(psk){
  payload = JSON.stringify(psk);
  console.log(psk.psk);
  xapi.command('HttpClient Put', {
    Header: ["X-Cisco-Meraki-API-Key: " + MERAKI_KEY, "Content-Type: application/json"],
    Url: MERAKI_URL + "/api/v0/networks/" + NETWORK_ID + "/ssids/" + SSID_NUMBER,
    AllowInsecureHTTPS: 'True'
  }, payload).then((result)=>{
    if(psk.psk === undefined){
      xapi.command('UserInterface Message Prompt Display', {
        Title: 'Guest Wifi',
        Text: 'Desabilitada!'
      });
    }else{
      xapi.command('UserInterface Message Prompt Display', {
        Title: SSID_NAME+' Habilitada!',
        Text: 'senha: '+ psk.psk
      });
    }

  }).catch((e)=>{
/*    if(e.data.StatusCode == 400){
     xapi.command('UserInterface Message Prompt Display', {
        Title: 'Guest Wifi',
        Text: 'Erro: Senha muito pequena, minimo de 8 caracteres'
      }); 
    }
    else{
      xapi.command('UserInterface Message Prompt Display', {
        Title: 'Guest Wifi',
        Text: 'Erro: '+ e.data.StatusCode
      });
    }*/
          xapi.command('UserInterface Message Prompt Display', {
        Title: 'Guest Wifi',
        Text: 'Erro: Equipamento desligado '+ e.data.StatusCode
      });
    xapi.command("UserInterface Extensions Widget SetValue", {
      WidgetId: 'wifi',
      value: 'off'
    });
  });
  
}

function guiEvent(event) {
  if (event.WidgetId === 'wifi') {
    if (event.Type === 'changed' && event.Value === 'on') {
      xapi.command('UserInterface Message TextInput Display', {
       FeedbackId: 'psk',
       Title: SSID_NAME,
       Text: 'Escolha uma senha (min 8 characters)',
       Placeholder: 'Senha'
      });
      console.log(event);
    } else if (event.Type === 'changed' && event.Value === 'off') {
      var data =
      {
        'name': SSID_NAME,
        'enabled': false
      };
      updateMerakiSSID(data)
    }
  }
}

xapi.event.on('UserInterface Extensions Widget Action', guiEvent);

xapi.event.on('UserInterface Message TextInput Response', (event) => {
  if (event.FeedbackId === 'psk') {
    var data =
    {
      'name': SSID_NAME,
      'enabled': true,
      'psk': event.Text
    };

    updateMerakiSSID(data)
  }
});

import { useState } from 'react';
import Collapsible from 'react-collapsible';
import './App.css';


function App() {
  const [clients, setClients] = useState([]);

  function ClientViewButton({ onClientClick }) {
    return (
      <button className="ClientViewButton" onClick={onClientClick}>
        {"View clients"}
      </button>
    );
  }
  
  function RsyncDetails({ clientId }) {
    console.log(clientId);
    const rsyncers = fetch(`http://localhost:8000/clients/${clientId}/rsyncers`).then(response => response.json()).then(data => data.map((rsyncer) => <p>{rsyncer.source}</p>));
    return {rsyncers};
  }
  
  function ClientDetails({ clients }) {
    console.log(clients);
    const clientItems = clients.map((client) => <p key={client.client_id}>
      <Collapsible trigger={client.client_id}>
      <b key={client.client_id} style={{color: client.connected ? "green": "red"}}>{client.client_id}</b><b>{`: ${client.visit} `}</b>
      <RsyncDetails clientId={client.client_id}/>
      </Collapsible>
    </p>);
    return (<ul>{clientItems}</ul>);
  }

  async function findClients() {
    const response = await fetch("http://localhost:8000/clients");
    const _clients =  await response.json();
    setClients(_clients);
  }

  return (
    <div className="App">
      <header className="App-header">
        <ClientViewButton onClientClick={findClients}/>
        <ClientDetails clients={clients}/>
      </header>
    </div>
  );
}

export default App;

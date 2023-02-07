import Tiptap from "./Tiptap.jsx"
import './style.css'
import { ChakraProvider } from "@chakra-ui/react";

function App() {
  
  return (
    <ChakraProvider>
      <div className="App">
        <Tiptap/>
      </div>
    </ChakraProvider>
  );
}

export default App;

import { Box, HStack, Tag, Text, Link, Progress } from "@chakra-ui/react";
import { Outlet, useLoaderData, Link as LinkRouter } from "react-router-dom";
import { Navbar } from "components/navbar";

import "styles/main.css"

const Root = () => {
    return (
        <div className='rootContainer'>
          <Box>
            <Navbar logo='/images/diamondgs.png' />
          </Box>
          <Box className='main'>
            <Outlet />
          </Box>
        </div>
      );
    };
    
export { Root };

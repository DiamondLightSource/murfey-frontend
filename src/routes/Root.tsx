import { Box, HStack, Tag, Text, Link, Progress } from "@chakra-ui/react";
import { Outlet, useLoaderData, Link as LinkRouter } from "react-router-dom";

const Root = () => {
    return (
        <div className='rootContainer'>
          <Box className='main'>
            <Outlet />
          </Box>
        </div>
      );
    };
    
export { Root };

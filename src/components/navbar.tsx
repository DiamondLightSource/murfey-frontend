import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  useDisclosure,
  Image,
  Tooltip,
  BoxProps,
  Icon,
} from "@chakra-ui/react";
import {
  MdMenu,
  MdClose,
  MdSignalWifi4Bar,
  MdOutlineSignalWifiBad,
} from "react-icons/md";
import { TbMicroscope, TbSnowflake, TbHomeCog } from "react-icons/tb";
import { getInstrumentConnectionStatus } from "loaders/general";
import { Link as LinkRouter } from "react-router-dom";
import React from "react";

export interface LinkDescriptor {
  label: string;
  route: string;
}

interface BaseLinkProps {
  links?: LinkDescriptor[];
  as?: React.ElementType;
}

export interface NavbarProps extends BaseLinkProps, BoxProps {
  logo?: string | null;
  children?: React.ReactElement;
}

const NavLinks = ({ links, as }: BaseLinkProps) => (
  <>
    {links
      ? links.map((link) => (
          <Link
            height="100%"
            alignItems="center"
            display="flex"
            px={2}
            textDecor="none"
            as={as}
            borderTop="4px solid transparent"
            borderBottom="4px solid transparent"
            color="murfey.50"
            _hover={{
              color: "murfey.500",
              borderBottom: "solid 4px",
            }}
            to={link.route}
            key={link.label}
          >
            {link.label}
          </Link>
        ))
      : null}
  </>
);

export const Navbar = ({ links, as, children, logo, ...props }: NavbarProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [instrumentConnectionStatus, setInsrumentConnectionStatus] =
    React.useState(false);

  // Check connectivity every few seconds
  React.useEffect(() => {
    const resolveConnectionStatus = async () => {
      try {
        const status: boolean = await getInstrumentConnectionStatus();
        setInsrumentConnectionStatus(status)
      } catch (err) {
        console.error("Error checking connection status:", err);
        setInsrumentConnectionStatus(false)
      }
    };
    resolveConnectionStatus();  // Fetch data once to start with

    // Set it to run every 4s
    const interval = setInterval(resolveConnectionStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box position="sticky" top="0" zIndex={1} w="100%" {...props}>
      <Flex
        bg="murfey.800"
        px={{ base: 4, md: "2vw" }}
        h={12}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <IconButton
          size={"sm"}
          icon={isOpen ? <MdClose /> : <MdMenu />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          bg="transparent"
          border="none"
          _hover={{ background: "transparent", color: "murfey.500" }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack h="100%" spacing={4} alignItems={"center"}>
          {logo
            ? (<Box maxW="5rem">
                <Image
                  alt=""
                  fit="cover"
                  paddingBottom={{ md: "6px", base: 0 }}
                  src={logo}
                />
              </Box>)
            : null
          }
          <Link as={LinkRouter} to="/hub">
            <Tooltip label="Back to the Hub">
              <IconButton
                size={"sm"}
                icon={<><TbHomeCog/></>}
                aria-label={"Back to the Hub"}
                _hover={{ background: "transparent", color: "murfey.500" }}
              />
            </Tooltip>
          </Link>
          <Link as={LinkRouter} to="/home">
            <Tooltip label="Back to the microscope">
              <IconButton
                size={"sm"}
                icon={<><TbSnowflake/><TbMicroscope/></>}
                aria-label={"Back to the microscope"}
                _hover={{ background: "transparent", color: "murfey.500" }}
              />
            </Tooltip>
          </Link>
          <Tooltip
            label={
              instrumentConnectionStatus
                ? "Connected to instrument server"
                : "No instrument server connection"
            }
            placement="bottom"
          >
            <Icon
              as={
                instrumentConnectionStatus
                  ? MdSignalWifi4Bar
                  : MdOutlineSignalWifiBad
              }
              color={instrumentConnectionStatus ? "white" : "red"}
            />
          </Tooltip>
        </HStack>
      </Flex>
    </Box>
  );
};

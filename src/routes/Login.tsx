import { Button, Input, VStack, Link, FormControl, Card, CardBody } from "@chakra-ui/react";
import { Link as LinkRouter, useNavigate, Navigate } from "react-router-dom";

import { getJWT, handshake } from "loaders/jwt";

import React from "react";

const Login = () => {
  const [username, setUsername] = React.useState("");
  const handleUsername = (event: React.ChangeEvent<HTMLInputElement>) =>
    setUsername(event.target.value);
  const [password, setPassword] = React.useState("");
  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);

  const navigate = useNavigate();

  return sessionStorage.getItem("murfeyServerURL") ? (
    <Card>
      <CardBody>
    <FormControl>
      <Input placeholder="Username" onChange={handleUsername} />
      <Input placeholder="Password" onChange={handlePassword} type="password" />
      <Link
        w={{ base: "100%", md: "19.6%" }}
        _hover={{ textDecor: "none" }}
        as={LinkRouter}
        to={`/home`}
      >
        <Button
          onClick={() => {
            getJWT({ username: username, password: password })
              .then((jwt) => sessionStorage.setItem("token", jwt.access_token))
              .then(() => handshake())
              .then(() => navigate("/home"));
          }}
        >
          Login
        </Button>
      </Link>
    </FormControl>
    </CardBody>
    </Card>
  ) : <Navigate to="/hub" replace />;
};

export { Login };

import {
    Button,
    Card,
    CardBody,
    FormControl,
    Heading,
    HStack,
    Input,
    VStack
} from '@chakra-ui/react'
import { TbMicroscope, TbSnowflake } from 'react-icons/tb'
import { Navigate, useNavigate } from 'react-router-dom'

import { getJWT } from 'loaders/jwt'

import { ChangeEvent, useState } from 'react'

const Login = () => {
    const [username, setUsername] = useState<string>('')
    const handleUsername = (event: ChangeEvent<HTMLInputElement>) =>
        setUsername(event.target.value)
    const [password, setPassword] = useState<string>('')
    const handlePassword = (event: ChangeEvent<HTMLInputElement>) =>
        setPassword(event.target.value)

    const navigate = useNavigate()

    const url = sessionStorage.getItem('murfeyServerURL')
    if (!url) {

        <Navigate to="/hub" replace />
    }
    const handleLoginButtonClick = () => {
        getJWT({
            username: username,
            password: password,
        })
            .then((jwt) => sessionStorage.setItem(
                'token',
                jwt.access_token
            )
            )
            .then(() => navigate('/home'))
    }

    // todo fix the {' '} setup
    return <VStack
        bg="murfey.700"
        justifyContent="start"
        alignItems="start"
        display="flex"
        w="100%"
        px="10vw"
        py="1vh"
    >
        <Heading size="xl" color="murfey.50">
            <HStack>
                {' '}
                <TbSnowflake /> <TbMicroscope />{' '}
            </HStack>{' '}
            Murfey Login
        </Heading>
        <Card>
            <CardBody>
                <FormControl>
                    <Input
                        placeholder="Username"
                        onChange={handleUsername}
                    />
                    <Input
                        placeholder="Password"
                        onChange={handlePassword}
                        type="password"
                    />
                    <Button
                        onClick={handleLoginButtonClick}
                    >
                        Login
                    </Button>
                </FormControl>
            </CardBody>
        </Card>
    </VStack>
}
export { Login }

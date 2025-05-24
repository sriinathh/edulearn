import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  useColorModeValue,
  Heading,
  ScaleFade,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const user = {
    name: "Srinath",
    email: "srinath@example.com",
    password: "srinath123",
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (email === user.email && password === user.password) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}! Redirecting to Home page...`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({ name: user.name, email: user.email })
      );

      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } else {
      toast({
        title: "Login Failed",
        description: "Incorrect email or password",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const bgGradient = useColorModeValue(
    "linear(to-r, teal.400, blue.500)",
    "linear(to-r, teal.600, blue.700)"
  );

  const boxBg = useColorModeValue("white", "gray.900");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const labelColor = useColorModeValue("gray.700", "gray.300");

  return (
    <Box
      w="100%"
      h="100vh"
      bgGradient={bgGradient}
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={6}
    >
      <ScaleFade initialScale={0.9} in={true}>
        <Box
          bg={boxBg}
          p={{ base: 8, md: 12 }}
          borderRadius="2xl"
          boxShadow="2xl"
          w={{ base: "90%", sm: "400px" }}
          maxW="400px"
          _hover={{ boxShadow: "3xl" }}
          transition="all 0.3s ease-in-out"
        >
          <Heading
            as="h2"
            size="xl"
            mb={8}
            fontWeight="extrabold"
            letterSpacing="wide"
            textAlign="center"
            bgGradient="linear(to-r, teal.400, blue.500)"
            bgClip="text"
          >
            Welcome Back
          </Heading>

          <form onSubmit={handleLogin}>
            <VStack spacing={6}>
              <FormControl id="email" isRequired>
                <FormLabel fontWeight="semibold" color={labelColor}>
                  Email Address
                </FormLabel>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg={inputBg}
                  border="none"
                  _focus={{ bg: "white", borderColor: "teal.400", boxShadow: "0 0 0 1px teal" }}
                  size="lg"
                  borderRadius="md"
                  boxShadow="sm"
                  transition="all 0.2s"
                />
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel fontWeight="semibold" color={labelColor}>
                  Password
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg={inputBg}
                    border="none"
                    _focus={{
                      bg: "white",
                      borderColor: "teal.400",
                      boxShadow: "0 0 0 1px teal",
                    }}
                    size="lg"
                    borderRadius="md"
                    boxShadow="sm"
                    transition="all 0.2s"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      size="md"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      _focus={{ boxShadow: "none" }}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                w="full"
                size="lg"
                colorScheme="teal"
                fontWeight="bold"
                boxShadow="md"
                _hover={{ boxShadow: "lg" }}
                transition="all 0.3s ease"
              >
                Log In
              </Button>
            </VStack>
          </form>
        </Box>
      </ScaleFade>
    </Box>
  );
};

export default Login;

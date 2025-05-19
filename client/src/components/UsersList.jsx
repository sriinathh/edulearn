import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Avatar, 
  Input, 
  InputGroup, 
  InputLeftElement,
  Heading,
  Divider,
  Badge,
  AvatarBadge,
  Flex,
  Spinner,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSearch, FiUser, FiInfo } from 'react-icons/fi';
import { format } from 'date-fns';
import { useUser } from '../context/UserContext';
import { getMockUsers } from '../utils/socketService';

const UsersList = ({ socket, communityId, currentUser, onSelectUser }) => {
  const { currentUser: userContext } = useUser();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Colors for light/dark mode
  const itemBgColor = useColorModeValue('white', 'gray.800');
  const itemHoverBgColor = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (socket && communityId && currentUser) {
      setLoading(true);
      setUsers([]);
      setFilteredUsers([]);

      // Request active users from server
      socket.emit('get_active_users', { communityId });

      // Listener for active users list
      socket.on(`active_users_${communityId}`, (activeUsers) => {
        const currentUserIncluded = activeUsers.some(user => user.id === currentUser.id);
        
        let updatedUsers = activeUsers;
        if (!currentUserIncluded) {
          updatedUsers = [
            {
              ...currentUser,
              status: 'online',
              isCurrentUser: true,
              lastActive: new Date().toISOString()
            },
            ...activeUsers
          ];
        } else {
          updatedUsers = activeUsers.map(user => ({
            ...user,
            isCurrentUser: user.id === currentUser.id
          }));
        }

        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setLoading(false);
      });

      // If no response within 2 seconds, fallback to mock users
      const timeout = setTimeout(() => {
        if (loading) {
          const mockUsers = getMockUsers(currentUser.id);
          const updatedMockUsers = [
            {
              ...mockUsers[0],
              id: currentUser.id,
              name: currentUser.name,
              avatar: currentUser.avatar,
              email: currentUser.email
            },
            ...mockUsers.slice(1)
          ];
          setUsers(updatedMockUsers);
          setFilteredUsers(updatedMockUsers);
          setLoading(false);
        }
      }, 2000);

      // Listen for user status changes
      socket.on('user_status_change', (userData) => {
        setUsers(prevUsers => {
          const exists = prevUsers.some(user => user.id === userData.id);
          if (exists) {
            return prevUsers.map(user => user.id === userData.id ? { ...user, ...userData } : user);
          } else {
            return [...prevUsers, userData];
          }
        });
      });

      // Listen for user disconnection
      socket.on('user_disconnected', (userId) => {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId 
              ? { ...user, status: 'offline', lastActive: new Date().toISOString() }
              : user
          )
        );
      });

      // Listen for new user joining community
      socket.on('user_joined_community', (userData) => {
        if (userData.communityId === communityId) {
          setUsers(prevUsers => {
            if (!prevUsers.some(user => user.id === userData.user.id)) {
              return [
                ...prevUsers,
                {
                  ...userData.user,
                  status: 'online',
                  isCurrentUser: userData.user.id === currentUser.id,
                  lastActive: new Date().toISOString()
                }
              ];
            }
            return prevUsers;
          });
        }
      });

      // Cleanup on unmount or dependencies change
      return () => {
        clearTimeout(timeout);
        socket.off(`active_users_${communityId}`);
        socket.off('user_status_change');
        socket.off('user_disconnected');
        socket.off('user_joined_community');
      };
    } else {
      // No community context - show mock users except current user
      const allUsers = getMockUsers(userContext?.id);
      const filteredList = allUsers.filter(user => user.id !== userContext?.id);
      setUsers(filteredList);
      setFilteredUsers(filteredList);
      setLoading(false);
    }
  }, [socket, communityId, currentUser, userContext]);

  // Filter users when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchTerm.toLowerCase();
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(query) ||
        (user.email && user.email.toLowerCase().includes(query))
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'green.500';
      case 'away':
        return 'yellow.500';
      case 'offline':
        return 'gray.400';
      default:
        return 'gray.400';
    }
  };

  // Format last active time
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';

    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';

    return `${days} days ago`;
  };

  // Separate users by status for grouping
  const onlineUsers = filteredUsers.filter(user => user.status === 'online');
  const awayUsers = filteredUsers.filter(user => user.status === 'away');
  const offlineUsers = filteredUsers.filter(user => user.status === 'offline');

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Active Users</Heading>
        <Tooltip label="Shows real-time active users in this community">
          <Box cursor="pointer"><FiInfo /></Box>
        </Tooltip>
      </Flex>

      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <FiSearch color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          borderRadius="full"
        />
      </InputGroup>

      <Divider mb={4} />

      {loading ? (
        <Flex justify="center" my={8}>
          <Spinner size="lg" color="teal.500" />
        </Flex>
      ) : (
        <>
          {onlineUsers.length > 0 && (
            <>
              <Text fontWeight="bold" mb={2} color="gray.600">
                Online - {onlineUsers.length}
              </Text>

              <VStack spacing={3} align="stretch" mb={6}>
                {onlineUsers.map(user => (
                  <HStack
                    key={user.id}
                    p={2}
                    borderRadius="md"
                    bg={user.isCurrentUser ? "teal.50" : itemBgColor}
                    _hover={{ bg: itemHoverBgColor, cursor: 'pointer' }}
                    onClick={() => onSelectUser(user)}
                    transition="all 0.2s"
                  >
                    <Avatar size="sm" name={user.name} src={user.avatar}>
                      <AvatarBadge
                        boxSize="1em"
                        bg={getStatusColor(user.status)}
                        border="2px solid white"
                      />
                    </Avatar>

                    <Box flex="1">
                      <HStack>
                        <Text fontWeight={user.isCurrentUser ? "bold" : "medium"}>
                          {user.name}
                        </Text>
                        {user.isCurrentUser && (
                          <Badge colorScheme="teal" fontSize="xs">You</Badge>
                        )}
                      </HStack>
                      {user.email && (
                        <Text fontSize="xs" color="gray.500">
                          {user.email}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                ))}
              </VStack>
            </>
          )}

          {awayUsers.length > 0 && (
            <>
              <Text fontWeight="bold" mb={2} color="gray.600">
                Away - {awayUsers.length}
              </Text>

              <VStack spacing={3} align="stretch" mb={6}>
                {awayUsers.map(user => (
                  <HStack
                    key={user.id}
                    p={2}
                    borderRadius="md"
                    bg={itemBgColor}
                    _hover={{ bg: itemHoverBgColor, cursor: 'pointer' }}
                    onClick={() => onSelectUser(user)}
                    transition="all 0.2s"
                  >
                    <Avatar size="sm" name={user.name} src={user.avatar}>
                      <AvatarBadge
                        boxSize="1em"
                        bg={getStatusColor(user.status)}
                        border="2px solid white"
                      />
                    </Avatar>

                    <Box flex="1">
                      <Text fontWeight="medium">{user.name}</Text>
                      {user.email && (
                        <Text fontSize="xs" color="gray.500">
                          {user.email}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                ))}
              </VStack>
            </>
          )}

          {offlineUsers.length > 0 && (
            <>
              <Text fontWeight="bold" mb={2} color="gray.600">
                Offline - {offlineUsers.length}
              </Text>

              <VStack spacing={3} align="stretch">
                {offlineUsers.map(user => (
                  <HStack
                    key={user.id}
                    p={2}
                    borderRadius="md"
                    bg={itemBgColor}
                    opacity={0.6}
                    _hover={{ bg: itemHoverBgColor, cursor: 'pointer' }}
                    onClick={() => onSelectUser(user)}
                    transition="all 0.2s"
                  >
                    <Avatar size="sm" name={user.name} src={user.avatar}>
                      <AvatarBadge
                        boxSize="1em"
                        bg={getStatusColor(user.status)}
                        border="2px solid white"
                      />
                    </Avatar>

                    <Box flex="1">
                      <Text fontWeight="medium">{user.name}</Text>
                      {user.email && (
                        <Text fontSize="xs" color="gray.500">
                          Last active {formatTimeAgo(user.lastActive)}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                ))}
              </VStack>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default UsersList;

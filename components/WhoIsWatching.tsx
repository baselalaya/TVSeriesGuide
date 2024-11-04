import React, { useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Image, StatusBar, LayoutRectangle } from 'react-native';
import { SafeAreaView, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    Easing,
    useSharedValue,
    runOnJS,
    FadeIn,
    withRepeat,
    withSequence,
    withDelay,
} from 'react-native-reanimated';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/contexts/UserContext';
import { Audio } from 'expo-av';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface Profile {
    id: string;
    name: string;
    avatar: string;
}

interface Props {
    onProfileSelect: (profileId: string) => void;
}

export function WhoIsWatching({ onProfileSelect }: Props) {
    const { profiles } = useUser();
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const profileRefs = useRef<{ [key: string]: LayoutRectangle | null }>({});
    const spinnerRotation = useSharedValue(0);

    const selectedProfilePosition = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });

    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: withTiming(isAnimating ? 0.9 : 1, {
                    duration: 800,
                    easing: Easing.bezier(0.33, 0, 0.67, 1),
                }),
            },
        ],
        opacity: withTiming(isAnimating ? 0 : 1, {
            duration: 500,
            easing: Easing.bezier(0.33, 0, 0.67, 1),
        }),
    }));

    const spinnerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotateZ: `${spinnerRotation.value}deg` }],
        };
    });

    const selectedProfileStyle = useAnimatedStyle(() => {
        if (!selectedProfile) return {};

        const finalSize = width * 0.45;
        const centerY = height / 2;
        const targetY = centerY - finalSize / 2 - 100; // Moved up to make room for spinner

        return {
            position: 'absolute',
            width: withTiming(finalSize, {
                duration: 700,
                easing: Easing.bezier(0.33, 0, 0.67, 1),
            }),
            height: withTiming(finalSize, {
                duration: 700,
                easing: Easing.bezier(0.33, 0, 0.67, 1),
            }),
            top: selectedProfilePosition.value.y,
            left: selectedProfilePosition.value.x,
            transform: [
                {
                    translateX: withTiming((width - finalSize) / 2 - selectedProfilePosition.value.x, {
                        duration: 700,
                        easing: Easing.bezier(0.33, 0, 0.67, 1),
                    }),
                },
                {
                    translateY: withTiming(targetY - selectedProfilePosition.value.y, {
                        duration: 700,
                        easing: Easing.bezier(0.33, 0, 0.67, 1),
                    }),
                },
                {
                    scale: withTiming(1.1, {
                        duration: 700,
                        easing: Easing.bezier(0.33, 0, 0.67, 1),
                    }),
                },
            ],
            borderRadius: withTiming(12, {
                duration: 700,
                easing: Easing.bezier(0.33, 0, 0.67, 1),
            }),
        };
    });

    const handleProfileSelect = async (profile: Profile) => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/audio/profile-selected.mp3')
            );
            await sound.playAsync();

            const layout = profileRefs.current[profile.id];
            if (layout) {
                selectedProfilePosition.value = {
                    x: layout.x,
                    y: layout.y,
                    width: layout.width,
                    height: layout.height,
                };
            }

            setSelectedProfile(profile);
            setIsAnimating(true);

            // Start spinner animation after profile is centered
            setTimeout(() => {
                setShowSpinner(true);
                spinnerRotation.value = withRepeat(
                    withTiming(360, {
                        duration: 1000,
                        easing: Easing.linear,
                    }),
                    -1, // Infinite repetition
                    false // Don't reverse the animation
                );
            }, 800);

            setTimeout(() => {
                runOnJS(onProfileSelect)(profile.id);
            }, 2000);
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <ThemedText style={styles.title}>Who's Watching?</ThemedText>
                </View>
                <TouchableOpacity>
                    <ThemedText style={styles.editButton}>Edit</ThemedText>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Animated.View style={[styles.gridContainer, containerStyle]}>
                    {profiles.map((profile, index) => (
                        <Animated.View
                            key={profile.id}
                            entering={FadeIn.delay(index * 100)}
                        >
                            <TouchableOpacity
                                onPress={() => handleProfileSelect(profile)}
                                style={styles.profileButton}
                                onLayout={(event) => {
                                    profileRefs.current[profile.id] = event.nativeEvent.layout;
                                }}
                            >
                                <Animated.View style={styles.profileContainer}>
                                    <Animated.Image
                                        source={{ uri: profile.avatar }}
                                        style={styles.avatar}
                                    />
                                    <ThemedText style={styles.profileName}>{profile.name}</ThemedText>
                                </Animated.View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}

                    <TouchableOpacity style={styles.profileButton}>
                        <View style={styles.addProfileContainer}>
                            <Ionicons name="add" size={44} color="#fff" />
                        </View>
                        <ThemedText style={styles.addProfileText}>Add Profile</ThemedText>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {selectedProfile && (
                <Animated.Image
                    source={{ uri: selectedProfile.avatar }}
                    style={[styles.selectedAvatar, selectedProfileStyle]}
                />
            )}

            {showSpinner && (
                <Animated.View style={[styles.spinnerContainer, spinnerStyle]}>
                    <Svg height="100" width="100" viewBox="0 0 100 100">
                        <Circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="#E50914"
                            strokeWidth="8"
                            fill="transparent"
                            strokeLinecap="round"
                            strokeDasharray="283"
                            strokeDashoffset="200"
                        />
                    </Svg>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    spinnerContainer: {
        position: 'absolute',
        left: width / 2 - 50,
        top: height / 2 + 50, // Position below the centered profile image
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        marginTop: -110,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTitle: {
        flex: 1,
        alignItems: 'center',
        height: 40,
        justifyContent: 'center'
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    editButton: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
        position: 'absolute',
        right: 0,
        top: -12,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: width,
        gap: 4,
        paddingHorizontal: 20,
    },
    profileButton: {
        width: width * 0.30,
        aspectRatio: 1,
        marginBottom: 24,
        alignItems: 'center',
    },
    profileContainer: {
        alignItems: 'center',
        gap: 8,
    },
    avatar: {
        width: '80%',
        height: undefined,
        aspectRatio: 1,
        borderRadius: 6,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#e5e5e5',
    },
    addProfileContainer: {
        width: width * (0.30 - 0.06),
        aspectRatio: 1,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#424242',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    addProfileText: {
        fontSize: 18,
        color: '#ffffff',
        marginTop: 8,
        fontWeight: '400',
    },
    selectedAvatar: {
        position: 'absolute',
        width: width * 0.3,
        height: width * 0.3,
        borderRadius: 8,
    },
});
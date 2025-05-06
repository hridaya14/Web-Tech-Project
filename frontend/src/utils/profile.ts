'use client'
export const getProfile = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/getProfile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!res.ok) {
            throw new Error('Failed to fetch user profile');
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Profile fetch failed', error);
        throw new Error('Unable to fetch profile');
    }
};


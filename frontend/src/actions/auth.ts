import { redirect } from "next/navigation";

export async function registerHandler(formData: FormData) {
    'use server'
    try {
        const rawForm = {
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password"),
            role: formData.get("role"),
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rawForm),
        });

        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            throw new Error(errorBody.message || "Registration failed");
        }

        redirect("/auth/login");
    } catch (err) {
        console.log(err)
        redirect("/auth/register")
    }
}

export async function loginHandler(formData: FormData) {
    'use server'
    try {
        const rawForm = {
            email: formData.get("email"),
            password: formData.get("password"),
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rawForm),
            credentials: "include",
        });

        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            throw new Error(errorBody.message || "Login failed");
        }

        redirect("/dashboard");
    } catch (err) {
        console.log(err)
        redirect("/auth/login")
    }
}


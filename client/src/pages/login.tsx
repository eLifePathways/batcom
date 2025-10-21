import { useState } from 'react'
import { useLogin, useToast } from '@/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation } from 'wouter'
import * as z from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AuthResponse, User } from '../../../shared/schema'
import { setToken } from '../lib/utils'

const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters ' }),
  password: z.string().min(1, { message: 'Please enter your password' }),
})

type FormValues = z.infer<typeof formSchema>

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [, navigate] = useLocation()
  const { toast } = useToast()

  const handleSuccess = ({ token }: AuthResponse, variables: Partial<User>) => {
    if (token) {
      setToken(token)
      navigate('/admin')
    } else {
      toast({
        title: 'Error',
        description: 'Failed to log in',
        variant: 'destructive',
      })

      setIsSubmitting(false)
    }
  }

  const handleError = (
    error: Error,
    variables: Partial<User>,
    context: unknown,
  ) => {
    toast({
      title: 'Login Failed',
      description: error.message,
      variant: 'destructive',
    })

    console.error('Error logging in:', error)

    setIsSubmitting(false)
  }
  const loginMutation = useLogin({
    onError: handleError,
    onSuccess: handleSuccess,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const handleLogin = async (data: FormValues) => {
    setIsSubmitting(true)

    const res = await loginMutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Login</h1>
          </div>
        </div>
      </div>
      <div className="flex justify-center align-center">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleLogin)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="w-full md:w-auto"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default Login

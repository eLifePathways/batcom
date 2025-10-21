import { useMutation } from '@tanstack/react-query'
import { AuthResponse, User } from '../../../shared/schema'
import { apiRequest } from '../lib/queryClient'

const LOGIN_URL = '/api/login'

type UseLoginProps = {
  onSuccess?: (
    data: AuthResponse,
    variables: Partial<User>,
  ) => Promise<any> | void
  onError?: (
    error: Error,
    variables: Partial<User>,
    context: unknown,
  ) => Promise<any> | void
}

const useLogin = ({ onSuccess, onError }: UseLoginProps) =>
  useMutation({
    mutationKey: [LOGIN_URL],
    mutationFn: async (data: Partial<User>): Promise<AuthResponse> =>
      apiRequest(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess,
    onError,
  })

export default useLogin

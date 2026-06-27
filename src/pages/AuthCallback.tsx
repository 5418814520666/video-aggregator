import { useParams, useSearchParams } from 'react-router-dom'

export default function AuthCallback() {
  const { provider } = useParams<{ provider: string }>()
  const [params] = useSearchParams()
  const status = params.get('status') || 'processing'
  const message = params.get('message') || '正在处理授权结果...'

  return (
    <div className="flex h-full flex-col items-center justify-center text-hub-muted">
      <h2 className="text-xl font-bold text-white">{provider} 授权</h2>
      <p className="mt-2">
        {status === 'success' ? '授权成功' : message}
      </p>
    </div>
  )
}

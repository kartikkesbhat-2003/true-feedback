'use client'
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Message } from "@/model/User"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, RefreshCcw } from "lucide-react"
import MessageCard from "@/components/MessageCard"
import { User } from "next-auth"


export default function DashboardPage () {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)

  const handleDeleteMessage = async (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId))
  }

  const { data : session } = useSession()

 

  const from = useForm({
    resolver: zodResolver(acceptMessageSchema),
  })

  const { register, watch, setValue } = from

  const acceptMessages = watch("acceptMessages")

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages")
      setValue("acceptMessages", response?.data.isAcceptingMessages ?? false)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message ?? "An error occurred while fetching messages.") 
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(false)
    try {
      const response = await axios.get<ApiResponse>("/api/get-messages")
      setMessages(response?.data.messages ?? [])
      if (refresh) {
        toast.success("Messages refreshed successfully.")
      }

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message ?? "An error occurred while fetching messages.") 
    } finally {
      setIsLoading(false)
      setIsSwitchLoading(false)
    }
  } , [setIsLoading, setIsSwitchLoading, setMessages])


  useEffect(() => {
    if (!session || !session.user) return
    fetchMessages()
    fetchAcceptMessages()
  }
  , [fetchMessages, fetchAcceptMessages,session, setValue])

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      })
      toast.success(response.data.message)
      setValue("acceptMessages", !acceptMessages)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message ?? "An error occurred while updating messages.")
    }
  }

   if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen mt-[-100px]">
        <Loader2 className="h-10 w-10 animate-spin mt" />
      </div>
    )
  }
  

  const { username } = session.user as User;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Link copied to clipboard!");
  };




  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl h-[600px] overflow-y-auto">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
              <MessageCard
              key={index}
              message={message}
              onMessageDelete={handleDeleteMessage}
              />
            
          ))
        ) : (
          <p className="text-gray-600 text-center">No messages to display.</p>
        )}
      </div>
    </div>
  );
}

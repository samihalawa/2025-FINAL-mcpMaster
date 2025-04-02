import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Server, InsertServer } from "@shared/schema";

// Get all servers
export function useServers() {
  return useQuery({
    queryKey: ["/api/servers"],
  });
}

// Get server by ID
export function useServer(id: number) {
  return useQuery({
    queryKey: [`/api/servers/${id}`],
    enabled: !!id,
  });
}

// Create a new server
export function useCreateServer() {
  return useMutation({
    mutationFn: async (server: InsertServer) => {
      const res = await apiRequest("POST", "/api/servers", server);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

// Update a server
export function useUpdateServer() {
  return useMutation({
    mutationFn: async ({ id, server }: { id: number; server: Partial<InsertServer> }) => {
      const res = await apiRequest("PATCH", `/api/servers/${id}`, server);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${data.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

// Delete a server
export function useDeleteServer() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/servers/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

// Start a server
export function useStartServer() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/servers/${id}/start`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${data.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

// Stop a server
export function useStopServer() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/servers/${id}/stop`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${data.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

// Restart a server
export function useRestartServer() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/servers/${id}/restart`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${data.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

// Get server stats
export function useServerStats() {
  return useQuery({
    queryKey: ["/api/stats"],
  });
}

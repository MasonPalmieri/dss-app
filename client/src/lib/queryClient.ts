import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { mockApi } from "./mockApi";

// Route all API calls through the Supabase-backed mockApi — no backend server needed
async function mockFetch(url: string, method = "GET", body?: unknown): Promise<unknown> {
  const u = url.replace(/^\/?/, "/").split("?");
  const path = u[0];
  const params = new URLSearchParams(u[1] || "");
  // userId is now a UUID string; fall back to empty string if not provided
  const userId = params.get("userId") || "";

  // Auth
  if (path === "/api/auth/login" && method === "POST") return mockApi.login((body as any).email, (body as any).password);
  if (path === "/api/auth/register" && method === "POST") return mockApi.register((body as any).fullName, (body as any).email, (body as any).password, (body as any).company || "");

  // Stats
  if (path === "/api/stats") return mockApi.getStats(userId);

  // Documents
  if (path === "/api/documents" && method === "GET") return mockApi.getDocuments(userId);
  if (path === "/api/documents" && method === "POST") return mockApi.createDocument(body as any);
  if (path.match(/^\/api\/documents\/(\d+)$/) && method === "GET") return mockApi.getDocument(parseInt(path.split("/")[3]));
  if (path.match(/^\/api\/documents\/(\d+)$/) && method === "PATCH") return mockApi.updateDocument(parseInt(path.split("/")[3]), body as any);
  if (path.match(/^\/api\/documents\/(\d+)$/) && method === "DELETE") return mockApi.deleteDocument(parseInt(path.split("/")[3]));
  if (path.match(/^\/api\/documents\/(\d+)\/send$/) && method === "POST") return mockApi.sendDocument(parseInt(path.split("/")[3]));
  if (path.match(/^\/api\/documents\/(\d+)\/void$/) && method === "POST") return mockApi.voidDocument(parseInt(path.split("/")[3]));

  // Recipients
  if (path.match(/^\/api\/documents\/(\d+)\/recipients$/) && method === "GET") return mockApi.getRecipients(parseInt(path.split("/")[3]));
  if (path.match(/^\/api\/documents\/(\d+)\/recipients$/) && method === "POST") return mockApi.createRecipient({ ...body as any, documentId: parseInt(path.split("/")[3]) });
  if (path.match(/^\/api\/recipients\/(\d+)$/) && method === "PATCH") return mockApi.updateRecipient(parseInt(path.split("/")[3]), body as any);

  // Fields
  if (path.match(/^\/api\/documents\/(\d+)\/fields$/) && method === "GET") return mockApi.getFields(parseInt(path.split("/")[3]));
  if (path.match(/^\/api\/documents\/(\d+)\/fields$/) && method === "POST") return mockApi.createField({ ...body as any, documentId: parseInt(path.split("/")[3]) });
  if (path.match(/^\/api\/fields\/(\d+)$/) && method === "PATCH") return mockApi.updateField(parseInt(path.split("/")[3]), body as any);
  if (path.match(/^\/api\/fields\/(\d+)$/) && method === "DELETE") return mockApi.deleteField(parseInt(path.split("/")[3]));

  // Templates
  if (path === "/api/templates" && method === "GET") return mockApi.getTemplates(userId);
  if (path === "/api/templates" && method === "POST") return mockApi.createTemplate(body as any);
  if (path.match(/^\/api\/templates\/(\d+)$/) && method === "GET") return mockApi.getTemplate(parseInt(path.split("/")[3]));
  if (path.match(/^\/api\/templates\/(\d+)$/) && method === "PATCH") return mockApi.updateTemplate(parseInt(path.split("/")[3]), body as any);
  if (path.match(/^\/api\/templates\/(\d+)$/) && method === "DELETE") return mockApi.deleteTemplate(parseInt(path.split("/")[3]));

  // Contacts
  if (path === "/api/contacts" && method === "GET") return mockApi.getContacts(userId);
  if (path === "/api/contacts" && method === "POST") return mockApi.createContact(body as any);
  if (path.match(/^\/api\/contacts\/(\d+)$/) && method === "PATCH") return mockApi.updateContact(parseInt(path.split("/")[3]), body as any);
  if (path.match(/^\/api\/contacts\/(\d+)$/) && method === "DELETE") return mockApi.deleteContact(parseInt(path.split("/")[3]));

  // Team
  if (path === "/api/team" && method === "GET") return mockApi.getTeam(userId);
  if (path === "/api/team" && method === "POST") return mockApi.createTeamMember(body as any);
  if (path.match(/^\/api\/team\/(\d+)$/) && method === "PATCH") return mockApi.updateTeamMember(parseInt(path.split("/")[3]), body as any);
  if (path.match(/^\/api\/team\/(\d+)$/) && method === "DELETE") return mockApi.deleteTeamMember(parseInt(path.split("/")[3]));

  // Audit logs
  if (path === "/api/audit-logs" && method === "GET") return mockApi.getAuditLogsByUser(userId);
  if (path.match(/^\/api\/documents\/(\d+)\/audit$/) && method === "GET") return mockApi.getAuditLogsByDocument(parseInt(path.split("/")[3]));

  // Notifications
  if (path === "/api/notifications" && method === "GET") return mockApi.getNotifications(userId);
  if (path.match(/^\/api\/notifications\/(\d+)\/read$/) && method === "POST") return mockApi.markNotificationRead(parseInt(path.split("/")[3]));
  if (path === "/api/notifications/read-all" && method === "POST") return mockApi.markAllNotificationsRead(userId);

  // Signer
  if (path.match(/^\/api\/sign\/.+$/) && method === "GET") return mockApi.getSignerInfo(path.split("/sign/")[1]);
  if (path.match(/^\/api\/sign\/.+$/) && method === "POST") return mockApi.submitSignature(path.split("/sign/")[1], body as any);

  // Users
  if (path.match(/^\/api\/users\/.+$/) && method === "GET") return mockApi.getUser(path.split("/")[3]);
  if (path.match(/^\/api\/users\/.+$/) && method === "PATCH") return mockApi.updateUser(path.split("/")[3], body as any);

  // Mass campaigns
  if (path === "/api/mass-campaigns" && method === "GET") return mockApi.getMassCampaigns(userId);
  if (path === "/api/mass-campaigns" && method === "POST") {
    const b = body as any;
    return mockApi.createMassCampaign(userId, { title: b.title, description: b.description, documentName: b.documentName });
  }
  if (path.match(/^\/api\/mass-campaigns\/(\d+)$/) && method === "GET") return mockApi.getMassCampaign(parseInt(path.split("/")[3]));
  if (path.match(/^\/api\/mass-campaigns\/(\d+)\/status$/) && method === "PATCH") return mockApi.updateMassCampaignStatus(parseInt(path.split("/")[3]), (body as any).status);
  if (path.match(/^\/api\/mass-campaigns\/(\d+)$/) && method === "DELETE") return mockApi.deleteMassCampaign(parseInt(path.split("/")[3]));
  if (path.match(/^\/api\/mass-campaigns\/token\/.+$/) && method === "GET") return mockApi.getMassCampaignByToken(path.split("/token/")[1]);
  if (path.match(/^\/api\/mass-campaigns\/(\d+)\/signers$/) && method === "GET") return mockApi.getMassSigners(parseInt(path.split("/")[3]));

  console.warn("[mockFetch] Unhandled route:", method, path);
  return null;
}

// apiRequest — used for mutations (POST, PATCH, DELETE)
export async function apiRequest(method: string, url: string, data?: unknown): Promise<Response> {
  const result = await mockFetch(url, method, data);
  // Return a fake Response-like object
  return {
    ok: true,
    status: 200,
    json: async () => result,
    text: async () => JSON.stringify(result),
  } as Response;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export function getQueryFn<T>(options: { on401: UnauthorizedBehavior }): QueryFunction<T> {
  const { on401: unauthorizedBehavior } = options;
  return async ({ queryKey }) => {
    const [path, ...rest] = queryKey as string[];
    let url = path;
    if (rest.length > 0 && rest.length % 2 === 0) {
      const params = new URLSearchParams();
      for (let i = 0; i < rest.length; i += 2) {
        params.set(rest[i], rest[i + 1]);
      }
      url = `${path}?${params.toString()}`;
    }
    try {
      return (await mockFetch(url)) as T;
    } catch (err: any) {
      if (unauthorizedBehavior === "returnNull" && err.message?.startsWith("401")) return null as T;
      throw err;
    }
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Zac API",
    version: "0.1.0",
    description: "MVP API surface for Zac user web and admin foundations.",
  },
  servers: [{ url: "/v1" }],
  tags: [
    { name: "health" },
    { name: "integrations" },
    { name: "gyms" },
    { name: "events" },
    { name: "session-plans" },
    { name: "logs" },
    { name: "posts" },
    { name: "media" },
    { name: "notifications" },
    { name: "feed" },
    { name: "reports" },
    { name: "announcements" },
    { name: "admin" },
  ],
  paths: {
    "/health": { get: operation("health", "Health check", "HealthResponse") },
    "/integrations": { get: operation("integrations", "Integration status", "IntegrationStatusResponse") },
    "/announcements": { get: operation("announcements", "List announcements", "AnnouncementListResponse") },
    "/announcements/{announcementId}": { get: operation("announcements", "Get announcement", "AnnouncementResponse", ["announcementId"]) },
    "/gyms": { get: operation("gyms", "List gyms", "GymListResponse") },
    "/gyms/{gymId}": { get: operation("gyms", "Get gym", "GymResponse", ["gymId"]) },
    "/gyms/{gymId}/save": {
      post: operation("gyms", "Save gym", "SaveGymResponse", ["gymId"]),
      delete: operation("gyms", "Unsave gym", "SaveGymResponse", ["gymId"]),
    },
    "/events": { get: operation("events", "List events", "EventListResponse") },
    "/events/{eventId}": { get: operation("events", "Get event", "EventResponse", ["eventId"]) },
    "/events/{eventId}/save": {
      post: operation("events", "Save event", "SaveEventResponse", ["eventId"]),
      delete: operation("events", "Unsave event", "SaveEventResponse", ["eventId"]),
    },
    "/session-plans": {
      get: operation("session-plans", "List session plans", "PlanListResponse"),
      post: operation("session-plans", "Create session plan", "PlanResponse", [], "CreateSessionPlanInput"),
    },
    "/session-plans/{planId}": { get: operation("session-plans", "Get session plan", "PlanResponse", ["planId"]) },
    "/session-plans/{planId}/join": {
      post: operation("session-plans", "Join session plan", "JoinPlanResponse", ["planId"]),
      delete: operation("session-plans", "Cancel session plan join", "JoinPlanResponse", ["planId"]),
    },
    "/session-plans/{planId}/complete": { post: operation("session-plans", "Complete session plan", "CompletePlanResponse", ["planId"]) },
    "/session-plans/{planId}/convert-to-log": { post: operation("session-plans", "Convert session plan to climbing log", "LogResponse", ["planId"]) },
    "/session-plans/{planId}/comments": {
      get: operation("session-plans", "List session plan comments", "CommentListResponse", ["planId"]),
      post: operation("session-plans", "Create session plan comment", "CommentResponse", ["planId"], "CreateCommentInput"),
    },
    "/logs": {
      get: operation("logs", "List climbing logs", "LogListResponse"),
      post: operation("logs", "Create climbing log", "LogResponse", [], "CreateClimbingLogInput"),
    },
    "/logs/{logId}": { get: operation("logs", "Get climbing log", "LogResponse", ["logId"]) },
    "/logs/{logId}/convert-to-post": { post: operation("logs", "Convert climbing log to post", "PostResponse", ["logId"]) },
    "/posts": {
      get: operation("posts", "List posts", "PostListResponse"),
      post: operation("posts", "Create post", "PostResponse", [], "CreatePostInput"),
    },
    "/posts/{postId}": { get: operation("posts", "Get post", "PostResponse", ["postId"]) },
    "/posts/{postId}/like": {
      post: operation("posts", "Like post", "LikePostResponse", ["postId"]),
      delete: operation("posts", "Unlike post", "LikePostResponse", ["postId"]),
    },
    "/posts/{postId}/save": {
      post: operation("posts", "Save post", "SavePostResponse", ["postId"]),
      delete: operation("posts", "Unsave post", "SavePostResponse", ["postId"]),
    },
    "/posts/{postId}/comments": {
      get: operation("posts", "List post comments", "CommentListResponse", ["postId"]),
      post: operation("posts", "Create post comment", "CommentResponse", ["postId"], "CreateCommentInput"),
    },
    "/feed": { get: operation("feed", "Get mixed feed", "FeedResponse") },
    "/reports": {
      get: operation("reports", "List reports", "ReportListResponse"),
      post: operation("reports", "Create report", "ReportResponse", [], "CreateReportInput"),
    },
    "/media/upload-urls": {
      post: operation("media", "Create signed media upload URLs", "MediaUploadUrlListResponse", [], "CreateMediaUploadUrlsInput"),
    },
    "/notifications": { get: operation("notifications", "List notifications", "NotificationListResponse") },
    "/notifications/{notificationId}/read": { patch: operation("notifications", "Mark notification read", "NotificationResponse", ["notificationId"]) },
    "/admin/audit-logs": { get: operation("admin", "List audit logs", "AuditLogListResponse") },
    "/admin/reports/{reportId}/status": { patch: operation("admin", "Update report status", "AdminReportStatusResponse", ["reportId"], "UpdateReportStatusInput") },
    "/admin/posts/{postId}/moderation": { post: operation("admin", "Moderate post", "AdminPostModerationResponse", ["postId"], "ModeratePostInput") },
    "/admin/gyms/{gymId}/status": { patch: operation("admin", "Update gym status", "AdminGymStatusResponse", ["gymId"], "UpdateGymStatusInput") },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer" },
    },
    schemas: {
      ErrorResponse: object({ error: ref("ApiError") }),
      ApiError: object({ code: { type: "string" }, message: { type: "string" }, details: {} }, ["code", "message", "details"]),
      Page: object({ limit: { type: "integer" }, cursor: { type: ["string", "null"] }, hasNext: { type: "boolean" } }, ["limit", "cursor", "hasNext"]),
      HealthResponse: data(object({ ok: { type: "boolean" } }, ["ok"])),
      IntegrationStatusResponse: data(object({
        supabase: { type: "boolean" },
        database: { type: "boolean" },
        posthog: { type: "boolean" },
        sentry: { type: "boolean" },
        storage: object({ userMediaBucket: { type: "string" }, gymPublicBucket: { type: "string" } }, ["userMediaBucket", "gymPublicBucket"]),
      }, ["supabase", "database", "posthog", "sentry", "storage"])),
      Gym: object({ id: string(), name: string(), area: string(), address: string(), disciplines: string(), openingHours: string(), saved: bool() }, ["id", "name", "area", "address", "disciplines", "openingHours", "saved"]),
      Event: object({ id: string(), title: string(), gymName: string(), startsAt: string(), endsAt: string(), capacity: string(), status: string() }, ["id", "title", "gymName", "startsAt", "endsAt", "capacity", "status"]),
      Plan: object({ id: string(), title: string(), place: string(), time: string(), members: string(), visibility: string() }, ["id", "title", "place", "time", "members", "visibility"]),
      Log: object({ id: string(), title: string(), place: string(), grade: string(), note: string() }, ["id", "title", "place", "grade", "note"]),
      Post: object({ id: string(), body: string(), authorName: string(), sourceType: string(), sourceLabel: string(), visibility: string() }, ["id", "body", "authorName", "sourceType", "sourceLabel", "visibility"]),
      Comment: object({ id: string(), body: string(), authorName: string(), createdAt: string() }, ["id", "body", "authorName", "createdAt"]),
      Announcement: object({ id: string(), title: string(), audience: string(), status: string(), publishedAt: string() }, ["id", "title", "audience", "status", "publishedAt"]),
      Report: object({ id: string(), targetType: string(), category: string(), status: string(), createdAt: string() }, ["id", "targetType", "category", "status", "createdAt"]),
      Notification: object({ id: string(), type: string(), title: string(), body: string(), targetType: string(), targetId: string(), readAt: { type: ["string", "null"] }, createdAt: string() }, ["id", "type", "title", "body", "targetType", "targetId", "readAt", "createdAt"]),
      FeedEntry: object({ type: string(), item: {} }, ["type", "item"]),
      CreateSessionPlanInput: object({ title: string(), gymId: nullableString(), placeName: nullableString(), disciplineId: nullableString(), startAt: string(), endAt: string(), visibility: string(), joinPolicy: string(), maxParticipants: { type: ["integer", "null"] }, note: nullableString() }, ["title", "startAt", "endAt"]),
      CreateClimbingLogInput: object({ sessionPlanId: nullableString(), gymId: nullableString(), placeName: nullableString(), disciplineId: nullableString(), climbedOn: string(), gradeText: nullableString(), summary: nullableString(), note: nullableString(), visibility: string() }, ["climbedOn"]),
      CreatePostInput: object({ body: string(), categoryId: nullableString(), visibility: string() }, ["body"]),
      CreateReportInput: object({ targetType: string(), targetId: string(), category: string(), note: nullableString() }, ["targetType", "targetId", "category"]),
      CreateCommentInput: object({ body: string() }, ["body"]),
      MediaUploadFileInput: object({ fileName: string(), contentType: string(), size: { type: "integer" } }, ["fileName", "contentType", "size"]),
      CreateMediaUploadUrlsInput: object({ targetType: string(), targetId: string(), files: { type: "array", items: ref("MediaUploadFileInput") } }, ["targetType", "files"]),
      MediaUploadUrl: object({ bucket: string(), path: string(), signedUrl: string(), token: string(), contentType: string(), maxBytes: { type: "integer" } }, ["bucket", "path", "signedUrl", "token", "contentType", "maxBytes"]),
      UpdateReportStatusInput: object({ status: string(), action: string(), reason: nullableString() }, ["status"]),
      ModeratePostInput: object({ action: string(), reason: nullableString() }, ["action"]),
      UpdateGymStatusInput: object({ status: string(), reason: nullableString() }, ["status"]),
      GymListResponse: dataArray("Gym"),
      GymResponse: dataRef("Gym"),
      EventListResponse: paginatedArray("Event"),
      EventResponse: dataRef("Event"),
      PlanListResponse: paginatedArray("Plan"),
      PlanResponse: dataRef("Plan"),
      LogListResponse: paginatedArray("Log"),
      LogResponse: dataRef("Log"),
      PostListResponse: paginatedArray("Post"),
      PostResponse: dataRef("Post"),
      CommentListResponse: paginatedArray("Comment"),
      CommentResponse: dataRef("Comment"),
      AnnouncementListResponse: paginatedArray("Announcement"),
      AnnouncementResponse: dataRef("Announcement"),
      ReportListResponse: dataArray("Report"),
      ReportResponse: dataRef("Report"),
      FeedResponse: dataArray("FeedEntry"),
      NotificationListResponse: paginatedArray("Notification"),
      NotificationResponse: dataRef("Notification"),
      MediaUploadUrlListResponse: dataArray("MediaUploadUrl"),
      AuditLogListResponse: paginatedArray("AuditLog"),
      AdminReportStatusResponse: data(object({ reportId: string(), status: string() }, ["reportId", "status"])),
      AdminPostModerationResponse: data(object({ postId: string(), action: string() }, ["postId", "action"])),
      AdminGymStatusResponse: data(object({ gymId: string(), status: string() }, ["gymId", "status"])),
      SaveGymResponse: data(object({ gymId: string(), saved: bool() }, ["gymId", "saved"])),
      SaveEventResponse: data(object({ eventId: string(), saved: bool() }, ["eventId", "saved"])),
      JoinPlanResponse: data(object({ planId: string(), joined: bool() }, ["planId", "joined"])),
      CompletePlanResponse: data(object({ planId: string(), completed: bool() }, ["planId", "completed"])),
      LikePostResponse: data(object({ postId: string(), liked: bool() }, ["postId", "liked"])),
      SavePostResponse: data(object({ postId: string(), saved: bool() }, ["postId", "saved"])),
    },
  },
};

function operation(tag, summary, responseSchema, pathParams = [], requestSchema) {
  const result = {
    tags: [tag],
    summary,
    parameters: pathParams.map((name) => ({ name, in: "path", required: true, schema: { type: "string" } })),
    responses: {
      200: jsonResponse(responseSchema),
      201: jsonResponse(responseSchema),
      404: jsonResponse("ErrorResponse"),
      422: jsonResponse("ErrorResponse"),
    },
  };
  if (requestSchema) {
    result.requestBody = {
      required: true,
      content: { "application/json": { schema: ref(requestSchema) } },
    };
  }
  return result;
}

function jsonResponse(schema) {
  return { content: { "application/json": { schema: ref(schema) } } };
}

function object(properties, required = []) {
  return { type: "object", properties, required };
}

function data(schema) {
  return object({ data: schema }, ["data"]);
}

function dataRef(name) {
  return data(ref(name));
}

function dataArray(name) {
  return data({ type: "array", items: ref(name) });
}

function paginatedArray(name) {
  return object({ data: { type: "array", items: ref(name) }, page: ref("Page") }, ["data", "page"]);
}

function ref(name) {
  return { $ref: `#/components/schemas/${name}` };
}

function string() {
  return { type: "string" };
}

function nullableString() {
  return { type: ["string", "null"] };
}

function bool() {
  return { type: "boolean" };
}

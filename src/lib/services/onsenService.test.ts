interface MockClient {
  from: jest.Mock;
  select: jest.Mock;
  order: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  then: jest.Mock;
  [key: string]: jest.Mock;
}

function createMockClient(): MockClient {
  const client = {} as MockClient;
  client.from = jest.fn();
  [
    "select",
    "order",
    "insert",
    "update",
    "delete",
    "eq",
    "single",
    "then",
  ].forEach((m) => (client[m] = jest.fn().mockReturnValue(client)));
  return client;
}
const mClient = createMockClient();
jest.mock("@supabase/supabase-js", () => ({ createClient: () => mClient }));

import { onsenService, Onsen } from "./onsenService";

describe("onsenService", () => {
  beforeEach(() => {
    // すべてのmockをリセット
    function resetAllMocks(obj: Record<string, unknown>) {
      Object.values(obj).forEach((fn) => {
        if (
          typeof fn === "object" &&
          fn !== null &&
          "mockReset" in fn &&
          typeof fn.mockReset === "function"
        ) {
          (fn as jest.Mock).mockReset();
        }
      });
    }
    resetAllMocks(mClient);
  });
  it("list: 正常に一覧取得できる", async () => {
    const mockData: Onsen[] = [
      {
        id: "1",
        name: "A",
        geo_lat: 1,
        geo_lng: 2,
        description: "",
        tags: [],
        images: [],
        created_at: null,
      },
    ];
    const mockFrom = createMockClient();
    mockFrom.select.mockImplementationOnce(() => mockFrom);
    mockFrom.order.mockImplementationOnce(() =>
      Promise.resolve({ data: mockData, error: null })
    );
    mClient.from.mockReturnValueOnce(mockFrom);
    const res = await onsenService.list();
    expect(res).toEqual(mockData);
  });

  it("create: 新規作成できる", async () => {
    const input = {
      name: "B",
      geo_lat: 1,
      geo_lng: 2,
      description: "",
      tags: [],
      images: [],
      created_at: null,
    };
    const mockRes = { ...input, id: "2" };
    const mockFrom = createMockClient();
    mockFrom.single.mockResolvedValueOnce({ data: mockRes, error: null });
    mClient.from.mockReturnValueOnce(mockFrom);
    const res = await onsenService.create(input as Omit<Onsen, "id">);
    expect(res).toEqual(mockRes);
  });

  it("update: 編集できる", async () => {
    const mockFrom = createMockClient();
    mockFrom.single.mockResolvedValueOnce({ data: { id: "1" }, error: null });
    mClient.from.mockReturnValueOnce(mockFrom);
    const res = await onsenService.update("1", { name: "C" });
    expect(res).toEqual({ id: "1" });
  });

  it("remove: 削除できる", async () => {
    const mockFrom = createMockClient();
    mockFrom.delete.mockImplementationOnce(() => mockFrom);
    mockFrom.eq.mockImplementationOnce(() => Promise.resolve({ error: null }));
    mClient.from.mockReturnValueOnce(mockFrom);
    await expect(onsenService.remove("1")).resolves.toBeUndefined();
  });

  it("bulkInsert: 一括登録できる", async () => {
    const mockFrom = createMockClient();
    mockFrom.insert.mockResolvedValueOnce({ error: null });
    mClient.from.mockReturnValueOnce(mockFrom);
    await expect(
      onsenService.bulkInsert([
        { name: "D", geo_lat: 1, geo_lng: 2, created_at: null, images: [] },
      ])
    ).resolves.toBeUndefined();
  });
});

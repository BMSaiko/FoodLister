import { buildFeedItems } from "@/libs/feed";

// A: review de actor público; B: review de actor privado (excluído).
const profiles = [
  { user_id: "u-pub", display_name: "Ana", avatar_url: null, user_id_code: "FL000001", public_profile: true },
  { user_id: "u-priv", display_name: "Bob", avatar_url: null, user_id_code: "FL000002", public_profile: false },
  { user_id: "u-target", display_name: "Carla", avatar_url: null, user_id_code: "FL000003", public_profile: true },
];

it("merge ordena por created_at desc e pagina", () => {
  const {
    data, total, hasMore,
  } = buildFeedItems(
    [{ id: "r1", user_id: "u-pub", user_name: "Ana", created_at: "2026-08-16T10:00:00Z", restaurants: { id: "res1", slug: "tasca", name: "A Tasca" } }],
    [{ id: "l1", creator_id: "u-pub", creator_name: "Ana", slug: "lis", name: "Top 5", created_at: "2026-08-16T12:00:00Z" }],
    [{ id: "f1", follower_id: "u-pub", following_id: "u-target", created_at: "2026-08-16T11:00:00Z" }],
    profiles,
    0, 2,
  );
  expect(total).toBe(3);
  expect(hasMore).toBe(true);
  // limit=2 -> slice 2 primeiros; ordenado desc: list (12h) -> follow (11h)
  expect(data.map((d) => d.id)).toEqual(["list-l1", "follow-f1"]);
  expect(data[0].actor.name).toBe("Ana");
});

it("exclui actors privados", () => {
  const reviews = [
    { id: "r1", user_id: "u-pub", user_name: "Ana", created_at: "2026-08-16T10:00:00Z", restaurants: { name: "X" } },
    { id: "r2", user_id: "u-priv", user_name: "Bob", created_at: "2026-08-16T10:30:00Z", restaurants: { name: "Y" } },
  ];
  const { data, total } = buildFeedItems(reviews, [], [], profiles, 0, 10);
  expect(total).toBe(1);
  expect(data[0].id).toBe("review-r1");
});

it("hasMore false quando slice cobre tudo", () => {
  const reviews = [
    { id: "r1", user_id: "u-pub", user_name: "Ana", created_at: "2026-08-16T10:00:00Z", restaurants: {} },
  ];
  const { hasMore } = buildFeedItems(reviews, [], [], profiles, 0, 10);
  expect(hasMore).toBe(false);
});

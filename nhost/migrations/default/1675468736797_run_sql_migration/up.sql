CREATE VIEW meeting_stats AS
SELECT o.id "orgId", date_trunc('day', m."startDate") "day", count(m.id)
  FROM meeting m INNER JOIN org o ON o.id = m."orgId"
  WHERE m."startDate" BETWEEN '2023-01-01' AND '2023-02-01'
  GROUP BY date_trunc('day', m."startDate"), o.id;

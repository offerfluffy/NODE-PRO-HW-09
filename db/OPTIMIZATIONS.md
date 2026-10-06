# OPTIMIZATIONS

## ===== q1 BEFORE =====

                                                                    QUERY PLAN
---

 Limit  (cost=6877.98..6879.84 rows=16 width=58) (actual time=5.059..6.276 rows=21 loops=1)
   Buffers: shared hit=234 read=4572
   ->  Gather Merge  (cost=6877.98..6879.84 rows=16 width=58) (actual time=5.058..6.273 rows=21 loops=1)
         Workers Planned: 2
         Workers Launched: 2
         Buffers: shared hit=234 read=4572
         ->  Sort  (cost=5877.95..5877.97 rows=8 width=58) (actual time=3.427..3.428 rows=7 loops=3)
               Sort Key: created_at DESC
               Sort Method: quicksort  Memory: 26kB
               Buffers: shared hit=234 read=4572
               Worker 0:  Sort Method: quicksort  Memory: 25kB
               Worker 1:  Sort Method: quicksort  Memory: 25kB
               ->  Parallel Seq Scan on products  (cost=0.00..5877.83 rows=8 width=58) (actual time=0.831..3.347 rows=7 loops=3)
                     Filter: ((seller_id = 15042) AND (created_at >= (now() - '1 year'::interval)) AND (created_at < (now() + '1 day'::interval)))
                     Rows Removed by Filter: 33326
                     Buffers: shared hit=160 read=4572
 Planning:
   Buffers: shared hit=92
 Planning Time: 0.335 ms
 Execution Time: 6.332 ms
(20 rows)

## ===== q2 BEFORE =====

                                                      QUERY PLAN
---

 Limit  (cost=2538.77..2538.90 rows=50 width=30) (actual time=6.931..6.938 rows=50 loops=1)
   Buffers: shared hit=1128
   ->  Sort  (cost=2538.77..2551.10 rows=4930 width=30) (actual time=6.929..6.932 rows=50 loops=1)
         Sort Key: created_at DESC
         Sort Method: top-N heapsort  Memory: 31kB
         Buffers: shared hit=1128
         ->  Seq Scan on orders  (cost=0.00..2375.00 rows=4930 width=30) (actual time=0.004..6.226 rows=5000 loops=1)
               Filter: (status = 'pending'::text)
               Rows Removed by Filter: 95000
               Buffers: shared hit=1125
 Planning:
   Buffers: shared hit=112
 Planning Time: 0.417 ms
 Execution Time: 6.980 ms
(14 rows)

## ===== q3 BEFORE =====

                                             QUERY PLAN
---

 Seq Scan on users  (cost=0.00..607.00 rows=100 width=63) (actual time=0.031..5.079 rows=1 loops=1)
   Filter: (lower(email) = '<user42@example.com>'::text)
   Rows Removed by Filter: 19999
   Buffers: shared hit=307
 Planning:
   Buffers: shared hit=69
 Planning Time: 0.274 ms
 Execution Time: 5.098 ms
(8 rows)

## ===== q4 BEFORE =====

                                                      QUERY PLAN
---

 Limit  (cost=5982.22..5982.25 rows=11 width=42) (actual time=12.928..12.932 rows=20 loops=1)
   Buffers: shared hit=262 read=4476
   ->  Sort  (cost=5982.22..5982.25 rows=11 width=42) (actual time=12.927..12.928 rows=20 loops=1)
         Sort Key: (ts_rank(search_vector, '''шкіряні'' & ''кросівки'''::tsquery)) DESC, id
         Sort Method: top-N heapsort  Memory: 27kB
         Buffers: shared hit=262 read=4476
         ->  Seq Scan on products  (cost=0.00..5982.03 rows=11 width=42) (actual time=0.053..12.746 rows=1000 loops=1)
               Filter: (search_vector @@ '''шкіряні'' & ''кросівки'''::tsquery)
               Rows Removed by Filter: 99000
               Buffers: shared hit=256 read=4476
 Planning:
   Buffers: shared hit=96
 Planning Time: 0.430 ms
 Execution Time: 12.979 ms
(14 rows)

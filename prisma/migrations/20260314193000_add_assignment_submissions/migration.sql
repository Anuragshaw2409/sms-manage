-- CreateTable
CREATE TABLE "AssignmentSubmission" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "submittedBy" TEXT,
    "solutionUrl" TEXT NOT NULL,
    "solutionFileName" TEXT,
    "remarks" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_studentId_key" ON "AssignmentSubmission"("assignmentId", "studentId");

-- CreateIndex
CREATE INDEX "AssignmentSubmission_schoolId_assignmentId_idx" ON "AssignmentSubmission"("schoolId", "assignmentId");

-- CreateIndex
CREATE INDEX "AssignmentSubmission_schoolId_studentId_idx" ON "AssignmentSubmission"("schoolId", "studentId");

-- CreateIndex
CREATE INDEX "AssignmentSubmission_schoolId_submittedAt_idx" ON "AssignmentSubmission"("schoolId", "submittedAt");

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;


DO $$
DECLARE
    r RECORD;
    policy_name TEXT;
BEGIN
    FOR r IN
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'schoolId'
        AND table_schema = 'public'
    LOOP

        EXECUTE format(
            'ALTER TABLE %I ENABLE ROW LEVEL SECURITY;',
            r.table_name
        );

        -- SELECT POLICY
        policy_name := 'tenant_select_' || lower(r.table_name);
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
            AND tablename = r.table_name
            AND policyname = policy_name
        ) THEN
            EXECUTE format(
                'CREATE POLICY %I
                ON %I
                FOR SELECT
                USING ("schoolId" = current_setting(''app.current_school_id'', true)::text);',
                policy_name, r.table_name
            );
        END IF;

        -- INSERT POLICY
        policy_name := 'tenant_insert_' || lower(r.table_name);
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
            AND tablename = r.table_name
            AND policyname = policy_name
        ) THEN
            EXECUTE format(
                'CREATE POLICY %I
                ON %I
                FOR INSERT
                WITH CHECK ("schoolId" = current_setting(''app.current_school_id'', true)::text);',
                policy_name, r.table_name
            );
        END IF;

        -- UPDATE POLICY
        policy_name := 'tenant_update_' || lower(r.table_name);
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
            AND tablename = r.table_name
            AND policyname = policy_name
        ) THEN
            EXECUTE format(
                'CREATE POLICY %I
                ON %I
                FOR UPDATE
                USING ("schoolId" = current_setting(''app.current_school_id'', true)::text);',
                policy_name, r.table_name
            );
        END IF;

        -- DELETE POLICY
        policy_name := 'tenant_delete_' || lower(r.table_name);
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
            AND tablename = r.table_name
            AND policyname = policy_name
        ) THEN
            EXECUTE format(
                'CREATE POLICY %I
                ON %I
                FOR DELETE
                USING ("schoolId" = current_setting(''app.current_school_id'', true)::text);',
                policy_name, r.table_name
            );
        END IF;

    END LOOP;
END $$;
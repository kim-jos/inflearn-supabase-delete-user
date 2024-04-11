import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.14.0';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Delete user account function");


// 아래 github에 있는 코드를 사용했습니다.
// https://github.com/the-digital-pro/supabase-delete-user/

serve(async (request) => {

  // OPTIONS 요청 메소드 처리를 위한 코드입니다 (브라우저 호환성)
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase 클라이언트 생성
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: request.headers.get('Authorization')! } } } // 이 부분에서 header에 넣은 사용자 token 사용
    );

    // 사용자 ID를 사용하여 사용자 객체 조회
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    // 토큰으로부터 사용자 식별에 문제가 있으면 오류 발생
    if (!user) throw new Error('No user found for JWT!');
  
    // 어드민작업을 수행할 수 있도록 서비스 역할 키를 사용하여 supabaseAdmin 클라이언트 생성
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // supabaseAdmin 클라이언트를 사용하고 user.id 전달하여 deleteUser 메소드 호출
    const { data: deletion_data, error: deletion_error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    
    // 삭제 오류 로깅, 디버깅을 위함. 필요 없으면 삭제가능!
    console.log(deletion_error);

    // 삭제된 사용자의 response
    return new Response('User deleted: ' + JSON.stringify(deletion_data, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // 문제가 발생한 경우 오류 메시지와 함께 오류 응답 반환
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
});
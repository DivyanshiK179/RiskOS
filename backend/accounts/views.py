from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, OfficialTier
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            response_data = UserSerializer(user).data
            return Response(
                {
                    "message": "User registered successfully.",
                    "user": response_data,
                    "approval_status": user.approval_status,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserManagementView(APIView):
    """
    Endpoint for Disaster Managers & Command Officers to list and manage department personnel.
    Supports filtering by tier and approval_status.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = User.objects.all().order_by("-date_joined")
        tier_filter = request.query_params.get("tier")
        status_filter = request.query_params.get("status")

        if tier_filter and tier_filter in OfficialTier.values:
            queryset = queryset.filter(tier=tier_filter)
        if status_filter:
            queryset = queryset.filter(approval_status=status_filter)

        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data)


class UserApprovalActionView(APIView):
    """
    Endpoint to approve, reject, or reassign a user's role and official tier.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get("action")  # "APPROVE", "REJECT", "UPDATE_ROLE", "UPDATE_TIER"
        if action == "APPROVE":
            target_user.approval_status = User.ApprovalStatus.APPROVED
            target_user.is_approved_by_nodal = True
            if "role" in request.data:
                target_user.role = request.data["role"]
            if "tier" in request.data and request.data["tier"] in OfficialTier.values:
                target_user.tier = request.data["tier"]
            target_user.save()
            return Response({"message": f"User {target_user.username} approved successfully."})
        elif action == "REJECT":
            target_user.approval_status = User.ApprovalStatus.REJECTED
            target_user.save()
            return Response({"message": f"User {target_user.username} rejected."})
        elif action == "UPDATE_ROLE":
            new_role = request.data.get("role")
            if new_role in User.Role.values:
                target_user.role = new_role
                target_user.save()
                return Response({"message": f"Role updated to {new_role}."})
            return Response({"error": "Invalid role value."}, status=status.HTTP_400_BAD_REQUEST)
        elif action == "UPDATE_TIER":
            new_tier = request.data.get("tier")
            if new_tier in OfficialTier.values:
                target_user.tier = new_tier
                target_user.save()
                return Response({"message": f"Official tier updated to {new_tier}."})
            return Response({"error": "Invalid tier value."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Invalid action specified."}, status=status.HTTP_400_BAD_REQUEST)

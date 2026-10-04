from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from .models import User, OfficialTier, AuthProvider


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["role"] = user.role
        token["department"] = user.department
        token["district"] = user.district
        token["approval_status"] = user.approval_status
        token["tier"] = user.tier
        token["official_id"] = user.official_id or ""
        token["cadre_designation"] = user.cadre_designation or ""
        token["assigned_district"] = user.assigned_district or user.district or ""
        token["is_2fa_enrolled"] = user.is_2fa_enrolled
        token["is_approved_by_nodal"] = user.is_approved_by_nodal
        token["auth_provider"] = getattr(user, "auth_provider", AuthProvider.GOVNET)
        token["auth_source"] = getattr(user, "auth_provider", AuthProvider.GOVNET)
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if user.approval_status in [User.ApprovalStatus.PENDING_APPROVAL, "PENDING", "PENDING_APPROVAL"]:
            raise AuthenticationFailed(
                "Your official department account is currently PENDING approval by the Disaster Manager. Please contact SEOC or wait for clearance."
            )
        if user.approval_status == User.ApprovalStatus.REJECTED:
            raise AuthenticationFailed(
                "Your department registration request was rejected by the Disaster Manager. Please reach out to your District Collectorate."
            )

        auth_source = self.initial_data.get("auth_provider", getattr(user, "auth_provider", AuthProvider.GOVNET))
        data["role"] = user.role
        data["approval_status"] = user.approval_status
        data["username"] = user.username
        data["department"] = user.department
        data["district"] = user.district
        data["tier"] = user.tier
        data["official_id"] = user.official_id or ""
        data["cadre_designation"] = user.cadre_designation or ""
        data["assigned_district"] = user.assigned_district or user.district or ""
        data["is_2fa_enrolled"] = user.is_2fa_enrolled
        data["is_approved_by_nodal"] = user.is_approved_by_nodal
        data["auth_provider"] = auth_source
        data["auth_source"] = auth_source
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "tier",
            "official_id",
            "cadre_designation",
            "assigned_district",
            "is_2fa_enrolled",
            "is_approved_by_nodal",
            "auth_provider",
            "approval_status",
            "department",
            "designation",
            "district",
            "phone_number",
            "employee_id",
            "is_staff",
            "date_joined",
        )
        read_only_fields = ("id", "date_joined")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "role",
            "tier",
            "official_id",
            "cadre_designation",
            "assigned_district",
            "auth_provider",
            "department",
            "designation",
            "district",
            "phone_number",
            "employee_id",
        )

    def create(self, validated_data):
        password = validated_data.pop("password")
        role = validated_data.get("role", User.Role.OFFICIAL)
        tier = validated_data.get("tier", OfficialTier.FIELD_RESPONDER)
        # Public users are auto-approved; official/superadmin personnel require manager approval gating
        approval = (
            User.ApprovalStatus.APPROVED
            if role == User.Role.PUBLIC
            else User.ApprovalStatus.PENDING_APPROVAL
        )
        user = User(
            approval_status=approval,
            tier=tier,
            is_approved_by_nodal=(approval == User.ApprovalStatus.APPROVED),
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user
